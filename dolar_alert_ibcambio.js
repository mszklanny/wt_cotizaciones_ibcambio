const request = require('request');
const nodemailer = require('nodemailer');

/*
* DOLAR ALERT IBCAMBIO
* ====================
* Send email whenever the dolar rate (48hs) from IBCambio.com goes below the threshold.
* In your mobile, configure an email filter and set a custom notification for it.
* Up to one email per day is sent.
* CRON settings: 1-59 10-17 * * 1-5
*/
module.exports = function(context, cb) {
  function getStorageData(callback) {
    context.storage.get(function (error, data){
      if (error) {
        return cb(error, null);
      }
      return callback(data);
    });
  }
  function getToken(storage, callback) {
    request.post('https://api.ibcambio.com/api/gettoken/', {
        json: {
          usuario: context.secrets.usuario,
          contrasena: context.secrets.contrasena
        }
      }, (error, res, body) => {
        if (error) {
          return cb(error, null);
        }
      return callback(storage, body);
      });
  }
  function sendEmail(cotizacion_venta, storage) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: context.secrets.emailuser,
        pass: context.secrets.emailpass
      }
    });

    var mailOptions = {
      from: context.secrets.emailuser,
      to: context.secrets.emailto,
      subject: '$' + cotizacion_venta + ' - ALERTA DE COMPRA DE DOLARES',
      text: 'https://ibcambio.com'
    };

    transporter.sendMail(mailOptions, function(erroremail, info){
      if (erroremail) {
        return cb(erroremail, info);
      }

      storage.last_notification = new Date().toDateString();
      context.storage.set(storage);
      return cb(null, "Email sent because the threshold ($" + storage.venta + ") was reached. Buy USD now at $" + cotizacion_venta + ".");
    });
  }

  function getCotizaciones (storage, token) {
    request.get('https://api.ibcambio.com/api/cotizaciones/', {headers: token}, (error, res, body) => {
        if (error) {
          return cb(error, null);
        }
        const json = JSON.parse(body);
        var cotizacion = json.Cotizaciones.find(function(element) {return element.plazo === '48hs.' && element.Moneda === 'Dolar Estadounidense';});
        if (json.Habil && cotizacion.Venta <= storage.venta) {
          sendEmail(cotizacion.Venta, storage);
        } else {
          return cb(null, "Nothing done. The current rate ($" + cotizacion.Venta + ") has not reached the threshold ($" + storage.venta + ") or the market is closed at the moment (Habil = " + json.Habil + ").");
        }
    });
  }
  getStorageData(function (storage){
    if (storage.last_notification === new Date().toDateString())
    {
      return cb(null, "Nothing done. The daily notification was already sent because the threshold ($" + storage.venta + ") was reached today.");
    }
    return getToken(storage, getCotizaciones);
  });
};
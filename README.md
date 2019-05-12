# wt_cotizaciones_ibcambio

DOLAR ALERT IBCAMBIO
====================
Send email whenever the dolar rate (48hs) from IBCambio.com goes below the threshold.
In your mobile, configure an email filter and set a custom notification for it.
Up to one email per day is sent.
CRON settings: 1-59 10-17 * * 1-5

Params
- venta: set the sell threshold. If the rate goes below this value, the alert will be triggered.
- clear_notification: set it to 1 to clear the "daily notification sent" flag.
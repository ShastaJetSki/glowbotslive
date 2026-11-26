/* GlowBots invoice — one template for the app preview / PDF and the email.
   Table layout + inline styles so Gmail, Outlook and Apple Mail all show it the same.
   renderInvoice(inv, profile, opts)
     inv:     platform_invoices row  { invoice_no, issued_at, due_at, next_invoice_date, line_items[], total, pay_url, status }
              line_items[i] = { title, description, features[], period_label, period_note, amount }
     profile: platform_settings.invoice_profile (from / bill-to / payment options / terms)
     opts:    { assets: { header, footer, logo, zelle }, forEmail: bool, clientName } */
(function (root) {
  var PINK = '#ff2e88', TEAL = '#14c3c3', INK = '#14182b', MUTED = '#4b5563', LINE = '#d9dde5';
  var COND = "'Oswald','Arial Narrow','Helvetica Neue',Arial,sans-serif";
  var BODY = "'Helvetica Neue',Arial,sans-serif";

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function money(n) { n = +n || 0; return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function day(s) { if (!s) return null; var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s)); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(s); }
  function longDate(s) { var d = day(s); return d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'; }

  function label(txt, color) {
    return '<div style="font-family:' + COND + ';font-size:20px;font-weight:600;letter-spacing:.5px;color:' + color + ';text-transform:uppercase;">' + esc(txt) + '</div>'
      + '<div style="width:74px;height:3px;background:' + color + ';margin:8px 0 18px;"></div>';
  }
  function icon(glyph, bg, size) {
    size = size || 46;
    return '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + bg + ';text-align:center;vertical-align:middle;font-size:' + Math.round(size * .46) + 'px;line-height:' + size + 'px;color:#fff;">' + glyph + '</td></tr></table>';
  }
  function contactRow(glyph, color, text) {
    return '<tr><td style="width:34px;padding:7px 0;font-size:18px;color:' + color + ';vertical-align:top;">' + glyph + '</td><td style="padding:7px 0;font-family:' + BODY + ';font-size:15px;color:' + INK + ';line-height:1.5;">' + text + '</td></tr>';
  }

  function renderInvoice(inv, p, opts) {
    p = p || {}; opts = opts || {}; var A = opts.assets || {};
    var items = (inv.line_items || []).map(function (l) { return typeof l === 'object' ? l : { title: String(l) }; });
    var total = inv.total != null ? +inv.total : items.reduce(function (a, l) { return a + (+l.amount || 0); }, 0);
    var clientName = p.bill_name || opts.clientName || 'Client';

    var head =
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#000;">'
      + '<tr><td style="width:62%;padding:0;vertical-align:top;">' + (A.header ? '<img src="' + esc(A.header) + '" alt="GlowBots — Automate. Elevate. Glow." width="430" style="display:block;width:100%;max-width:430px;height:auto;border:0;">' : '<div style="font-family:' + COND + ';font-size:64px;font-weight:700;padding:40px;color:' + PINK + ';">GLOW<span style="color:' + TEAL + '">BOTS</span></div>') + '</td>'
      + '<td style="padding:26px 22px 18px 6px;vertical-align:top;">'
      + '<div style="font-family:' + COND + ';font-size:52px;font-weight:700;letter-spacing:3px;color:#fff;line-height:1;margin-bottom:16px;">INVOICE</div>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:' + COND + ';font-size:15px;">'
      + [['INVOICE #:', inv.invoice_no, TEAL], ['INVOICE DATE:', longDate(inv.issued_at), TEAL], ['DUE DATE:', longDate(inv.due_at), PINK], ['NEXT INVOICE:', inv.next_invoice_date ? longDate(inv.next_invoice_date) : '—', TEAL]]
        .map(function (r) { return '<tr><td style="color:#fff;padding:5px 12px 5px 0;white-space:nowrap;">' + r[0] + '</td><td style="color:' + r[2] + ';font-weight:600;padding:5px 0;white-space:nowrap;">' + esc(r[1]) + '</td></tr>'; }).join('')
      + '</table></td></tr></table>';

    var parties =
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
      + '<tr><td style="width:38%;padding:8px 18px 16px 0;vertical-align:top;border-right:1px solid ' + LINE + ';">'
      + label('From', PINK)
      + '<div style="font-family:' + COND + ';font-size:22px;color:' + INK + ';margin-bottom:12px;">' + esc(p.from_name || 'GlowBots') + '</div>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
      + (p.from_phone ? contactRow('&#9990;', PINK, esc(p.from_phone)) : '')
      + (p.from_email ? contactRow('&#9993;', PINK, esc(p.from_email)) : '')
      + (p.from_web ? contactRow('&#127760;', PINK, esc(p.from_web)) : '')
      + '</table></td>'
      + '<td style="padding:8px 0 16px 20px;vertical-align:top;">'
      + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="vertical-align:top;">'
      + label('Bill To', TEAL)
      + '<div style="font-family:' + COND + ';font-size:22px;color:' + INK + ';margin-bottom:12px;">' + esc(clientName) + '</div>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">'
      + (p.bill_phone ? contactRow('&#9990;', '#1d4ed8', esc(p.bill_phone)) : '')
      + ((p.bill_address1 || p.bill_address2) ? contactRow('&#128205;', '#1d4ed8', esc(p.bill_address1 || '') + (p.bill_address2 ? '<br>' + esc(p.bill_address2) : '')) : '')
      + '</table></td>'
      + (A.logo ? '<td style="width:130px;vertical-align:middle;text-align:right;padding-top:40px;"><img src="' + esc(A.logo) + '" alt="' + esc(clientName) + '" width="130" style="display:block;width:130px;height:auto;border:0;margin-left:auto;"></td>' : '')
      + '</tr></table></td></tr></table>';

    var rows = items.map(function (l) {
      var feats = (l.features || []).filter(Boolean);
      return '<tr>'
        + '<td style="padding:18px 16px;vertical-align:top;border-right:1px solid ' + LINE + ';">'
        + '<div style="font-family:' + COND + ';font-size:17px;font-weight:600;color:' + INK + ';margin-bottom:6px;">' + esc(l.title || 'Service') + '</div>'
        + (l.description ? '<div style="font-family:' + BODY + ';font-size:13.5px;color:' + MUTED + ';line-height:1.55;">' + esc(l.description) + '</div>' : '')
        + (feats.length ? '<div style="font-family:' + BODY + ';font-size:13.5px;font-weight:700;color:' + INK + ';margin-top:10px;">Features added.</div><ol style="margin:4px 0 0;padding-left:20px;font-family:' + BODY + ';font-size:13.5px;color:' + INK + ';line-height:1.6;">' + feats.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ol>' : '')
        + '</td>'
        + '<td style="padding:18px 12px;vertical-align:top;text-align:center;border-right:1px solid ' + LINE + ';"><div style="font-family:' + COND + ';font-size:16px;font-weight:600;color:' + INK + ';padding-top:24px;">' + esc(l.period_label || '') + '</div>' + (l.period_note ? '<div style="font-family:' + BODY + ';font-size:13px;color:' + MUTED + ';margin-top:4px;">' + esc(l.period_note) + '</div>' : '') + '</td>'
        + '<td style="padding:18px 16px;vertical-align:top;text-align:center;"><div style="font-family:' + COND + ';font-size:17px;font-weight:600;color:' + INK + ';padding-top:24px;">' + money(l.amount) + '</div></td>'
        + '</tr>';
    }).join('');

    var services =
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:6px;"><tr>'
      + '<td style="width:60px;vertical-align:middle;">' + icon('&#9881;', PINK, 54) + '</td>'
      + '<td style="vertical-align:middle;padding-left:12px;"><div style="font-family:' + COND + ';font-size:22px;font-weight:600;color:' + TEAL + ';text-transform:uppercase;">Services Rendered</div>'
      + '<div style="font-family:' + BODY + ';font-size:14px;color:' + INK + ';margin-top:2px;">' + esc(p.services_blurb || ('Professional CRM services and ongoing support for ' + clientName + '.')) + '</div></td></tr></table>'
      + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:16px;border:1px solid ' + LINE + ';">'
      + '<tr style="background:' + PINK + ';background-image:linear-gradient(90deg,' + PINK + ' 0%,#2a1430 45%,#0e3c45 70%,' + TEAL + ' 100%);">'
      + ['Description', 'Service Period', 'Amount'].map(function (h, i) { return '<td style="padding:13px 12px;text-align:center;font-family:' + COND + ';font-size:17px;font-weight:600;color:#fff;letter-spacing:.5px;text-transform:uppercase;' + (i === 0 ? 'width:46%;' : i === 1 ? 'width:30%;' : '') + '">' + h + '</td>'; }).join('')
      + '</tr>' + rows
      + '<tr><td style="border-top:1px solid ' + LINE + ';"></td><td style="border-top:1px solid ' + LINE + ';border-left:1px solid ' + LINE + ';padding:12px 16px;font-family:' + COND + ';font-size:16px;font-weight:600;color:' + INK + ';">SUBTOTAL</td><td style="border-top:1px solid ' + LINE + ';border-left:1px solid ' + LINE + ';padding:12px 16px;text-align:right;font-family:' + COND + ';font-size:16px;font-weight:600;color:' + INK + ';">' + money(total) + '</td></tr>'
      + '<tr><td></td><td style="background:#0d3a44;padding:14px 16px;font-family:' + COND + ';font-size:21px;font-weight:600;color:#fff;">TOTAL DUE</td><td style="background:' + TEAL + ';padding:14px 16px;text-align:right;font-family:' + COND + ';font-size:24px;font-weight:700;color:#fff;">' + money(total) + '</td></tr>'
      + '</table>';

    var payBtn = inv.pay_url && inv.status !== 'paid'
      ? '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:4px 0 14px;"><tr><td style="background:' + PINK + ';border-radius:8px;"><a href="' + esc(inv.pay_url) + '" style="display:inline-block;padding:12px 24px;font-family:' + COND + ';font-size:17px;font-weight:600;color:#fff;text-decoration:none;letter-spacing:.5px;">PAY ONLINE WITH CARD &rarr;</a></td></tr></table>'
      : (inv.status === 'paid' ? '<div style="display:inline-block;margin:4px 0 14px;padding:8px 18px;border:2px solid #16a34a;border-radius:8px;font-family:' + COND + ';font-size:18px;font-weight:700;color:#16a34a;">PAID' + (inv.paid_at ? ' · ' + longDate(inv.paid_at) : '') + '</div>' : '');

    /* monthly invoices are card-only; the quarterly one also takes check / Zelle */
    var cardOnly = (inv.pay_methods || (inv.kind === 'monthly' ? 'card' : 'all')) === 'card';
    var cardNote = cardOnly && !inv.pay_url && inv.status !== 'paid'
      ? '<div style="font-family:' + COND + ';font-size:17px;color:' + PINK + ';margin:4px 0 8px;">PAY BY CARD</div><div style="font-family:' + BODY + ';font-size:13px;color:' + INK + ';line-height:1.5;">Use the secure &ldquo;Pay online&rdquo; link in your invoice email. Cards on file are charged automatically on the due date.</div>' : '';
    var bottom =
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:18px;"><tr>'
      + '<td style="width:50%;vertical-align:top;padding:6px 18px 10px 0;border-right:1px solid ' + LINE + ';">'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td>' + icon('&#128179;', PINK, 46) + '</td><td style="padding-left:14px;font-family:' + COND + ';font-size:22px;font-weight:600;color:' + PINK + ';">PAYMENT OPTIONS</td></tr></table>'
      + '<div style="height:10px"></div>' + payBtn + cardNote
      + (cardOnly && inv.pay_url && inv.status !== 'paid' ? '<div style="font-family:' + BODY + ';font-size:13px;color:' + INK + ';">Card payments only. Cards on file are charged automatically on the due date.</div>' : '')
      + (!cardOnly && p.check_payable ? '<div style="font-family:' + COND + ';font-size:14px;color:' + INK + ';">CHECK PAYABLE TO:</div><div style="font-family:' + COND + ';font-size:19px;color:' + PINK + ';margin:2px 0 8px;">' + esc(p.check_payable) + '</div>' : '')
      + (!cardOnly && p.check_payable && p.zelle_to ? '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:2px 0 8px;"><tr><td style="border-top:1px solid ' + PINK + ';"></td><td style="width:34px;text-align:center;font-family:' + BODY + ';font-size:11px;color:' + INK + ';">OR</td><td style="border-top:1px solid ' + PINK + ';"></td></tr></table>' : '')
      + (!cardOnly && p.zelle_to ? '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="vertical-align:middle;">' + (A.zelle ? '<img src="' + esc(A.zelle) + '" alt="Zelle" width="44" height="44" style="display:block;border:0;border-radius:50%;">' : '') + '</td><td style="padding-left:12px;vertical-align:middle;"><div style="font-family:' + COND + ';font-size:14px;color:' + INK + ';">SEND PAYMENT TO:</div><div style="font-family:' + COND + ';font-size:17px;color:' + PINK + ';">' + esc(p.zelle_to) + '</div></td></tr></table>' : '')
      + (!cardOnly && p.memo ? '<div style="font-family:' + BODY + ';font-size:13px;color:' + INK + ';margin-top:8px;">Please include <span style="color:' + TEAL + ';">&ldquo;' + esc(p.memo) + '&rdquo;</span><br>in the memo or notes.</div>' : '')
      + '</td>'
      + '<td style="vertical-align:top;padding:6px 0 10px 22px;">'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="vertical-align:top;">' + icon('&#128197;', '#0f7c82', 46) + '</td><td style="padding-left:14px;"><div style="font-family:' + COND + ';font-size:22px;font-weight:600;color:' + TEAL + ';">NEXT INVOICE</div>'
      + '<div style="font-family:' + BODY + ';font-size:13.5px;color:' + INK + ';margin-top:4px;">' + (inv.next_invoice_date ? 'The next invoice will be sent on' : 'No further invoice is scheduled.') + '</div>'
      + (inv.next_invoice_date ? '<div style="font-family:' + COND + ';font-size:20px;color:' + TEAL + ';margin-top:2px;">' + longDate(inv.next_invoice_date) + '.</div>' : '') + '</td></tr></table>'
      + '<div style="border-top:1px solid ' + LINE + ';margin:14px 0;"></div>'
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr><td style="vertical-align:top;">' + icon('&#128203;', '#0f7c82', 46) + '</td><td style="padding-left:14px;"><div style="font-family:' + COND + ';font-size:22px;font-weight:600;color:' + TEAL + ';">TERMS</div>'
      + '<div style="font-family:' + BODY + ';font-size:14px;color:' + PINK + ';margin-top:4px;">' + esc(p.terms || 'Payment is due upon receipt.') + '</div>'
      + '<div style="font-family:' + BODY + ';font-size:13px;color:' + INK + ';margin-top:6px;">Thank you for your business and continued trust in ' + esc(p.from_name || 'GlowBots') + '!</div>' + (inv.notes ? '<div style="font-family:' + BODY + ';font-size:13px;color:' + MUTED + ';margin-top:8px;">' + esc(inv.notes) + '</div>' : '') + '</td></tr></table>'
      + '</td></tr></table>';

    var foot = A.footer ? '<img src="' + esc(A.footer) + '" alt="Thank you for trusting GlowBots to power your business! We build systems. You grow. We glow." width="680" style="display:block;width:100%;height:auto;border:0;">'
      : '<div style="background:#000;color:' + PINK + ';padding:18px;text-align:center;font-family:' + COND + ';font-size:22px;">Thank you for trusting GlowBots</div>';

    return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#000;"><tr><td align="center" style="padding:0;">'
      + '<table role="presentation" width="680" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:680px;max-width:100%;background:#000;">'
      + '<tr><td style="padding:0;">' + head + '</td></tr>'
      + '<tr><td style="padding:0 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border-radius:12px;"><tr><td style="padding:26px 28px 24px;">'
      + parties + '<div style="border-top:1px solid #9aa0ab;margin:8px 0 18px;"></div>' + services + bottom
      + '</td></tr></table></td></tr>'
      + '<tr><td style="padding:10px 0 0;border-top:2px solid ' + PINK + ';">' + foot + '</td></tr>'
      + '</table></td></tr></table>';
  }

  /* the whole e-mail / print document */
  function invoiceDocument(inv, p, opts) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>Invoice ' + esc(inv.invoice_no) + '</title>'
      + '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">'
      + '<style>body{margin:0;background:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact;}@page{size:letter;margin:0;}@media print{body{background:#000;}}</style>'
      + '</head><body>' + renderInvoice(inv, p, opts) + '</body></html>';
  }

  var api = { renderInvoice: renderInvoice, invoiceDocument: invoiceDocument, money: money, longDate: longDate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GBInvoice = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

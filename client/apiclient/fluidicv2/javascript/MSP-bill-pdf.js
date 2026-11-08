function generateMSPBill(billDetailsText, billDetailsValue)
{
    var basicTable1 = [
        {name: billDetailsText.billingPeriod, value: billDetailsValue.startDate + ' ' + billDetailsText.to + ' ' + billDetailsValue.endDate},
        {name: billDetailsText.dueDate, value: billDetailsValue.dueDate},
        {name: billDetailsText.dueAmount, value: billDetailsValue.netTotal + ' ' + billDetailsValue.currencyCode}
    ]
    var basicTable2 = [
        {name: billDetailsText.customerName, value: escapeHTML(billDetailsValue.customerName)},
        {name: billDetailsText.deviceCount, value: billDetailsValue.deviceCount},
        {name: billDetailsText.costperdevice, value: billDetailsValue.costPerDevice + ' ' + billDetailsValue.currencyCode},
        {name: billDetailsText.billingcycle, value: billDetailsValue.billingCycle},
        {name: billDetailsText.emailID, value: escapeHTML(billDetailsValue.emailID)}
    ]
    var detailsTable = [
        {sNo: '1', description: billDetailsText.planName + ' - ' + escapeHTML(billDetailsValue.servicePlanName) + ' [ ' + billDetailsValue.billingCycle + ' | ' + billDetailsValue.deviceCount + ' ' + billDetailsText.devices + ' | ' + billDetailsValue.startDate + ' ' + billDetailsText.to + ' ' + billDetailsValue.endDate + ' ]', amount: billDetailsValue.grossTotal},
        {sNo: '2', description: billDetailsText.othercharge, amount: billDetailsValue.otherCharges},
        {sNo: '3', description: billDetailsText.tax + '(' + billDetailsValue.taxPercentage + '%)', amount: billDetailsValue.taxValue}
    ]
    var basicTableHtml1, basicTableHtml2, detailsTableHtml;
    basicTableHtml1 = basicTable1.reduce(function(total, obj) {
        return total + '<tr><td>' + obj.name + '</td><td>' + obj.value + '</td></tr>';
    }, '');
    basicTableHtml2 = basicTable2.reduce(function(total, obj) {
        return total + '<div class="divTableTow"><div class="divTableCell">' + obj.name + '</div><div class="divTableCell">' + obj.value + '</div></div>';
    }, '');
    detailsTableHtml = detailsTable.reduce(function(total, obj) {
        return total + '<tr><td>' + obj.sNo + '</td> <td>' + obj.description + '</td><td>' + billDetailsValue.currencyCode + '</td><td>' + obj.amount + '</td></tr>'
    }, '');
    var totalRow = '<td></td><td>' + billDetailsText.netTotal + '</td><td><b>' + billDetailsValue.currencyCode + '</b></td><td class="total"><b>' + billDetailsValue.netTotal + '</b></td>';
    $('#invoiceBasicTable1').html(basicTableHtml1);
    $('#invoiceBasicTable2').html(basicTableHtml2);
    $('#invoiceDetails').html(detailsTableHtml);
    $('#totalRow').html(totalRow);
    $('#invoiceGenTime b').text(billDetailsText.note + ':');
    $('#invoiceGenTime ul').html('<li>' + billDetailsText.generatedAt + ' ' + billDetailsValue.generatedTime + '</li><li>' + billDetailsText.dateFormat + ': ' + billDetailsValue.dateFormat + '</li>');
    $('#invoiceNo').text(billDetailsText.invoiceNo+ ': #' + billDetailsValue.invoiceNo);
    $('#detailsLabel').text(billDetailsText.details);
    $('#detailTableHeadings').html('<th>'+ billDetailsText.serialNo +'</th><th>'+ billDetailsText.description + '</th><th></th><th>'+ billDetailsText.amount + '</th>');
    window.canvasLoaded = true;
}

function escapeHTML(string) {
    var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
    };
    var htmlEscaper = /[&<>"'\/]/g;
    return ('' + string).replace(htmlEscaper, function(match) {
        return htmlEscapes[match];
    });
}
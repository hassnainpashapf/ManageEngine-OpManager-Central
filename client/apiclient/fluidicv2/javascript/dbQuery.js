//$Id$
        function readCsrfToken(name)
        {
            var ca = document.cookie.split(';');
            var nameEQ = name + "=";
            for(var i=0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' '){
    	            c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) == 0){
    	            return c.substring(nameEQ.length, c.length);
                }
            }
            return "";
        }
        function getI18nTranslatedValue(key)
        {
        	if(key!=="" && key!==undefined && window.OPM.translatedkeys[key]!==undefined)
        	{
        		return window.OPM.translatedkeys[key];
        	}
        }
        function executeQuery()
        {
            var qry = $('#statement').val(); //No I18N
            $('#DBCountCaption').show();
            $('#resultDiv').show();

            if( qry == "" ) {
                alert(getI18nTranslatedValue("webclient.dbquery.empty"));//No I18N
                $('#resultDiv').hide();
                $("#exportCSV").hide();
                return false;
            }

            $("#DBCountCaption").html("");
            $.jgrid.gridUnload("#qryResultList"); //No I18N

            var apiURL = window.OPM.apiUrlPattern + '/admin/SubmitQuery'; //No I18N

            if(window.OPM.isNFACentral && sessionStorage !== undefined && sessionStorage.selectedProbeId !== undefined) {
                apiURL += "?collOpt="+sessionStorage.selectedProbeId; //No I18N
            }
            else if(window.OPM.isMSPCentral){            
                var selectedCustomerID = window.OPM.selCustomerID;
                var selectedRegionID = window.OPM.selRegionID;
                selectedCustomerID = selectedCustomerID ? selectedCustomerID : '-1'
                selectedRegionID = window.OPM.selRegionID = selectedCustomerID == '-1'? '-1' : window.OPM.selRegionID ; 
                apiURL += "?selCustomerID=" + selectedCustomerID +'&regionID=' + selectedRegionID; //No I18N
            }
            else if(window.OPM.isOPMCentral || window.OPM.isOPMPlusCentral) {
                var eeProbeId = $('#eeProbeSelect').val();
                if(eeProbeId != -1) {
                    apiURL += "?eeProbeID=" + eeProbeId; //No I18N
                }
            }
            $.ajax({
                url: apiURL,
                type: 'POST', //No I18N
                headers: {
		            'X-ZCSRF-TOKEN':'opmcsrftoken='+readCsrfToken('opmcsrfcookie') //No I18N
	            },
                data:{'query':qry},//No I18N
                success: function(response)
                {
                    var rowCnt=0;
                    var message = "";
                    $("#exportCSV").hide();
                    if(response.data !== undefined && response.data.length!==0) {    
                        rowCnt = response.data.length;
                        $('.opmQueryExecute').hide();
                        $('.opmQueryFieldbtn').show();
                        $("#exportCSV").show();
                    }
                    if (response.error !== undefined) {
                        alert(response.error.message); 
                        $('#DBCountCaption').hide();
                        $('#resultDiv').hide();
                        return;
                    } 

                    var colNames = [];
                    var colModel = [];
                    var cnt = 0;
                    var captionTitle = "";
                    for(var i=0;i<response.columnNames.length;i++) {
                        colNames.push(response.columnNames[i].toUpperCase());
                        colModel.push({'name':response.columnNames[i].toLowerCase(),'index':response.columnNames[i].toLowerCase()}); //No I18N
                        cnt++;
                    }
                    captionTitle = "<div><span style='font:20px BitterRegular'>Rows  : "+rowCnt+"  Columns :  "+cnt+"</span></div>"; //No I18N
                    $("#DBCountCaption").html(captionTitle);
                    $("#qryResultList").jqGrid({
                        datatype: "local", //No I18N
                        data: response.data,
                        colNames:escapeGridColumnNames(colNames),
                        colModel:colModel,
                        rowNum:100,
                        height:'auto',//No I18N
                        prmNames:{totalrows:null},
                        shrinkToFit: true,
                        forceFit:true,
                        repeatitems:false,
                        searchOption:true,
                        columnChooser:true,
                        toggleSearch:true,
                        rowList:[100,200,300,500,1000,rowCnt],
                        loadonce: true,
                        pager:'#qryResultPager',//No I18N
                        search:true,
                        toolbar:[true,"top"],
                        caption:"",
                        ignoreCase: true,
                        autoencode: true
                    });
                    if(colModel.length == 1) {
                        $('#qryResultPager').css('width', '300');//No I18N
                    }
                    $("#qryResultList").jqGrid('filterToolbar',{ stringResult: true, searchOnEnter: false, defaultSearch: 'cn'});//No I18N
                    $("#qryResultList")[0].toggleToolbar();
                    $(".ui-search-toolbar").show();
                },
                statusCode: {
                    401: function(){
                        window.location.href="/apiclient/ember/Login.jsp";
                    }
                }
            });
        }

        function opm_generateCSV(grid,captionTitle,file,isReturnCSVData) {
            if(captionTitle===undefined||captionTitle===null||captionTitle==="") {
                captionTitle='Grid Data';// No I18N
            }
            var mymodel = grid.getGridParam('colModel');//No I18N
            var mydata = grid.jqGrid('getGridParam','data');//No I18N
            var arrData = [];
            $.each(mydata, function (index, rowData) {
                arrData.push(rowData);
            });
            var headers=grid.jqGrid("getGridParam", "colNames");//No I18N
            var fileName=(file == undefined)?captionTitle:file;
            var ReportTitle=captionTitle
            var CSV = '';   //No I18N
            var excludeColumns=[];
            var includeColumns=[];

            CSV += ReportTitle + '\r\n\n';//No I18N

            for (var colName in arrData[0]) {
                if(opm_isHTML(arrData[0][colName])) {
                    excludeColumns.push(colName);
                }
            }

            if (true) {
                var row = "";//No I18N
                if(headers) {
                    for (var i = 0; i < headers.length; i++) {  
                        if(!mymodel[i].hidden && excludeColumns.indexOf(mymodel[i].name) < 0 && !opm_isHTML(headers[i])) {  
                            row +='"' + headers[i] + '",'; //No I18N
                            includeColumns.push(mymodel[i].name);
                        }else {  
                            excludeColumns.push(mymodel[i].name);
                        }   
                    }
                }
                row = row.slice(0, -1);     
                CSV += row + '\r\n';//No I18N
            }

            var exclude='<span class="pointer">';//No I18N
            var exclude1="<a href=";//No I18N
            for (var i = 0; i < arrData.length; i++) {
                var row = "";//No I18N

                for (var j=0; j<includeColumns.length; j++) {
                    var toinsert=arrData[i][includeColumns[j]];

                    if(toinsert.indexOf(exclude)>-1) {
                        var html = $.parseHTML(toinsert);
                        row += '"' + $(html).text().trim() + '",';//No I18N
                    }else if(toinsert.indexOf(exclude1)>-1) {
                        var html = $.parseHTML(toinsert);
                        row += '"' + $(html).text().trim() + '",';//No I18N
                    }else {
                        row += '"' + toinsert + '",';//No I18N
                    }
                }
                row = row.slice(0, -1); 
                CSV += row + '\r\n';//No I18N
            }

            if(isReturnCSVData) {
                return CSV;
            }
            opm_saveAsCSVFile(CSV,fileName);
        }

        function opm_saveAsCSVFile(csvData,fileName) {

            if (csvData == '') { //No I18N
                alert('Invalid data'); //No I18N
                return;
            }

            csvData+='\r\n\r\n\r\n\r\n\r\n\r\n\r\n'; //No I18N
            csvData+='"*************************************************************** Note :  ***********************************************************************"\r\n'; //No I18N
            csvData+='"*  This report may contain Personal Data. Please exercise due care while sharing this report to someone.     *"\r\n'; //No I18N
            csvData+='"***********************************************************************************************************************************************"\r\n'; //No I18N

            fileName = fileName+'.csv'; //No I18N

            if(navigator.msSaveBlob !== undefined) {
                var blobObject = new Blob([csvData]); 
                window.navigator.msSaveBlob(blobObject,fileName);
            }else {
                var link = document.createElement("a");    //No I18N
                link.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csvData); //No I18N
                link.style = "visibility:hidden";//No I18N
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        function opm_isHTML(str) {
            var a = document.createElement('div');// No I18N
            a.innerHTML = str;
            var exclude='<span class="pointer">';// No I18N
            var exclude1="<a href=";// No I18N
            if(str.indexOf(exclude)>-1) {
                return false;
            }
            else if(str.indexOf(exclude1)>-1) {
                return false;
            }
            for (var c = a.childNodes, i = c.length; i--; ) {
                if (c[i].nodeType == 1) {
                    return true;
                } 
            }
            return false;
        }

        function exportToCSV() {
            var date = new Date().toLocaleString().split(", ");
            var fileName = date[0];
            if(date[1] !== undefined){
                fileName = fileName + ' ' + date[1];
            }
            var reportHeader = getI18nTranslatedValue("webclient.dbquery.Report.Type")+' : '+getI18nTranslatedValue("webclient.dbquery.submitquery")+'\r\n'; //No I18N
            reportHeader += getI18nTranslatedValue("webclient.dbquery.query")+' : '+$('#statement').val()+'\r\n'; //No I18N
            reportHeader += getI18nTranslatedValue("webclient.dbquery.generatedon")+' : '+fileName+'\r\n\r\n'; //No I18N
            opm_generateCSV($('#qryResultList'),reportHeader,"Submit_Query_Report_"+(fileName.replace(/:/g,"_")).replace(/ /g,"_"));//No I18N
        }
        function selectCustomerList(value){
            $('#customSelection').find('li').removeClass('active');
            $('#probeSelection').find('li').removeClass('active');
            $('#probeSelection').find('.probeList').remove();
            if(value == "-1") {
                window.OPM.selCustomerID = '-1';
                window.OPM.selRegionID = '-1'; 
                $('#customSelection').find('li[value="'+ value +'"]').addClass('active');
                $('.text').attr("value","-1").text("All Customers"); //No I18N
                $('.selectCustProbe').removeClass('active');
                $('#header').removeClass('selectCustProbe-opened');
            }
            else {
                $.each(window.OPM.mspCustomerNameList, function(index, obj) {
                    if(value == obj.CustomerID) {
                        $('#customSelection').find('li[value="'+ value +'"]').addClass('active');
                            if(obj.CustomerStatus) {
                            $.each(obj.ProbeInfo, function(key, val) {
                                if(val.ProbeStatus) {
                                    $('#probeSelection').append($('<li class = "probeList text-ellipsis" onclick=selectProbeList("'+ val.RegionID +'","'+ value +'")></li>').attr("value",val.RegionID).text(val.ProbeDisplayName).prop('title',val.ProbeDisplayName)) //No I18N
                                }
                            });
                            $.each(obj.ProbeInfo, function(key, val) {
                                if(!val.ProbeStatus) {
                                    $('#probeSelection').append($('<li class = "disabled probeList" title="Probe is Disabled"></li>').attr("value",val.RegionID).text(val.ProbeDisplayName)) //No I18N
                                }
                            });
                        } 
                    }
                });
            } 
        }
        function selectProbeList(probeid,custid) {
             $('#probeSelection').find('li').removeClass('active');
             $('#probeSelection').find('li[value="'+ probeid +'"]').addClass('active');
             $.each(window.OPM.mspCustomerNameList, function(index, obj) {
                if(custid == obj.CustomerID) {
                    $('.text').attr("value",obj.CustomerID).text(obj.CustomerName); //No I18N
                    $.each(obj.ProbeInfo, function(key, val) {
                        if(probeid == val.RegionID) {
                            $('.text').append($('<span></span>').text(val.ProbeDisplayName).prop('title',val.ProbeDisplayName));
                        }
                    });
                }
            });
            window.OPM.selRegionID = probeid;
            window.OPM.selCustomerID = custid;
            $('.selectCustProbe').removeClass('active');
            $('#header').removeClass('selectCustProbe-opened');
        }
        function escapeHTML(string){
            if(string===undefined){
                return "";
            }else{
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
        };
        function escapeGridColumnNames(colNamesList)
        {
            var formatterColumnNames = [];
            if(colNamesList!==undefined)
            {
                formatterColumnNames = $.extend(true,[],colNamesList);
                for(var i=0;i<formatterColumnNames.length;i++)
                {
                    formatterColumnNames[i] = escapeHTML(formatterColumnNames[i]);
                }           
            }
            return formatterColumnNames;
        }

$(document).ready(function()
{
	if(window.OPM!==undefined && window.OPM.isAuthorized && window.OPM.mspUserType !== "Customer" && window.OPM.isMSPCentral) {
	     $(".selectCustProbe").show();
	     window.OPM.selCustomerID = '-1';
	     window.OPM.selRegionID = '-1'; 
	     $('.text').attr('value','-1').text("All Customers"); //No I18N
	     $('#customSelection').append($('<li class="customerList" onclick=selectCustomerList("-1")></li>').addClass('active').attr("value","-1").text("All Customers")) //No I18N
	     $('.selectCustProbe').removeClass('selected');
	     $("#msp_probeSelect").on("click", function() {
	         if($('.selectCustProbe').hasClass('active')){
	             $('.selectCustProbe').removeClass('active');
	             $('#header').removeClass('selectCustProbe-opened');
	         } else if(!$('.selectCustProbe').hasClass('disabledBlock')){
	             selectCustomerList(window.OPM.selCustomerID);
	             $('#customSelection').find('li[value="'+ window.OPM.selCustomerID +'"]').addClass('active');
	             $('#probeSelection').find('li[value="'+ window.OPM.selRegionID +'"]').addClass('active');
	             $('#header').addClass('selectCustProbe-opened');
	             $('.selectCustProbe').addClass('active');
	         }
	     });
	     $('html').click(function(e){
	         if(!$(e.target).closest('.selectCustProbe,.selectCustProbe__DD,selectCustProbe__label').length){
	             $('#header').removeClass('selectCustProbe-opened');
	             $('.selectCustProbe').removeClass('active');
	             $('.selectCustProbe__customer li').removeClass('active');
	         }
	     });
	     $.ajax({
	         url: window.OPM.apiUrlPattern + '/admin/listCustomerNames?selCustomerID=-1&regionID=-1', //No I18N
	         type: 'GET', //No I18N
	         headers: {
	             'X-ZCSRF-TOKEN':'opmcsrftoken='+readCsrfToken('opmcsrfcookie') //No I18N
	         },
	         success: function(response) {
	             if (response.error) {
	                 opm_infoMsgs("errorMsg", response.error.message); //No I18N
	                 return;
	             }
	             $.each(response, function(index, obj) {
	                 if(obj.CustomerStatus) {                            
	             $('#customSelection').append($('<li class = "customerList text-ellipsis" onclick=selectCustomerList("'+ obj.CustomerID +'") value='+ obj.CustomerID +'></li>').text(obj.CustomerName).prop('title',obj.CustomerName));
	                 }
	             });
	             $.each(response, function(index, obj) {
	                 if(!obj.CustomerStatus) {                            
	             $('#customSelection').append($('<li class = "customerList disabled" title="Customer is Disabled" value='+ obj.CustomerID +'></li>').text(obj.CustomerName));
	                 }
	             });
	             window.OPM.mspCustomerNameList = response;
	         }
	     });
	} else if(window.OPM!==undefined && (window.OPM.isOPMCentral || window.OPM.isOPMPlusCentral)){
		 $('#eeProbeSelectionDiv').show();
		 $('#eeProbeSelect').select2();
		 $.ajax({
		     url: window.OPM.apiUrlPattern + '/enterprise/listProbes', //No I18N
		     type: 'GET', //No I18N
		     headers: {
		         'X-ZCSRF-TOKEN':'opmcsrftoken='+readCsrfToken('opmcsrfcookie') //No I18N
		     },
		     success: function(response) {
		         if (response.error) {
		             opm_infoMsgs("errorMsg", response.error.message); //No I18N
		             return;
		         }
	             $.each(response, function(index, obj) {
	                 if(obj.STATUS) {         
	                     $('#eeProbeSelect').append($('<option></option>').val(obj.PROBEID).text(obj.DISPLAYNAME).prop('title',obj.DISPLAYNAME));//No I18N                
	                 }
	             });
	             $.each(response, function(index, obj) {
	                 if(!obj.STATUS) {                            
	                     $('#eeProbeSelect').append($('<option title="Probe is Disabled" disabled></option>').val(obj.PROBEID).text(obj.DISPLAYNAME));//No I18N
	                 }
	             });
	         }
	     });
	}
});
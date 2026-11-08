// $Id$
//This is used for pasting in the web SSH/Telnet window
function handlepaste (e) {
    var content = "";
    if ((e && e.clipboardData && e.clipboardData.getData) || (window.clipboardData && window.clipboardData.getData)) {
        if (e && e.clipboardData) {
            var i = 0;
             while (i < e.clipboardData.types.length) {
                    var key = e.clipboardData.types[i];
               /*     if (/text\/html/.test(key)) {
                content = e.clipboardData.getData('text/html'); //NO I18N
                        break;
            }
                    else */
                if (/text\/plain/.test(key)) {
                content = e.clipboardData.getData('text/plain'); //NO I18N
                        break;
            }
                    i++;
        }
        
        }
        
        if (window.clipboardData) {
            var text = window.clipboardData.getData('Text'); //NO I18N
            var url = window.clipboardData.getData('URL'); //NO I18N
            content = text;
            if (url !== null) {
                content = url;
            }
        }
        
        t_paste(content);
        if (e && e.preventDefault) {
            e.stopPropagation();
            e.preventDefault();
        }
        return false;
    }
    else {
        t_paste(content);
        return true;
    }
}
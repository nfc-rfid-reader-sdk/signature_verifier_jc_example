/* Used:
 * Bootstrap v3.3.6 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 
 The MIT License (MIT)

Copyright (c) 2011-2018 Twitter, Inc.
Copyright (c) 2011-2018 The Bootstrap Authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

// uFR .X509 Verifier version 1.3

var r;
var progress;

window.onload = function() {
    getTitleByOS();

    var json = '{"operation":"verify","user_id":0}';
    
    var pem_file = document.getElementById('pem_file');
    pem_file.addEventListener("change", function () {
        if (pem_file.files[0].length != 0)
        {
        	clearStatus();
        	clearOutput();
        	cert_box = document.getElementById("certificate");
        	cert_box.value = 'Uploading pem file: "' + pem_file.files[0].name + '"' + "\r\n";
        	cert_box.value += "Checking certificate...\r\n";
        	upload(pem_file.files[0], json, 'http://zboractest.d-logic.net/proxy/x509-verifier.php');
        }
        else
        	alert("Please select PDF file to upload.");
    })
    
    pem_file.addEventListener("click", function () {
    	progress.style.width = '0%';
        pem_file.value = null;
    })

    var pdf_file = document.getElementById('pdf_file');
    pdf_file.addEventListener("change", function () {
        if (pdf_file.files[0].length != 0)
        {
        	clearStatus();
        	clearOutput();
        	cert_box = document.getElementById("certificate");
        	cert_box.value = 'Uploading PDF file: "' + pdf_file.files[0].name + '"' + "\r\n";
        	cert_box.value += "Checking signature...\r\n";
        	upload(pdf_file.files[0], json, 'http://zboractest.d-logic.net/proxy/pdf-sgn-verifier.php');
        }
        else
        	alert("Please select PDF file to upload.");
    })
    
    pdf_file.addEventListener("click", function () {
    	progress.style.width = '0%';
        pdf_file.value = null;
    })
    
    progress = document.getElementById('progress');
};
  
function getTitleByOS()
{
    var OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows") != -1) OSName="Windows";
    else if (window.navigator.userAgent.indexOf("Linux") != -1) OSName="Linux";
    else if (window.navigator.userAgent.indexOf("Mac") != -1) OSName="macOS / iOS";
    else if (window.navigator.userAgent.indexOf("X11") != -1) OSName="UNIX";
    
    if (OSName !== "Unknown")
        document.getElementById("h2_title").innerHTML = "D-Logic .X509 Verifier running on " + OSName
}

function upload(file, json, url)
{
	document.body.style.cursor = 'wait';

	var data = new FormData();
    data.append('file', file);
    data.append('query', json);

    var request = GetXmlHttpObject();
    request.onreadystatechange = function() {
        if(this.readyState == 4) {
        	if (this.status === 200)
            {
                console.log(this.response);
                var resp = rawResponseToObject(this.response);
                cert_box.value += "Finished.\r\n";
                setStatus(resp.status);
                setOutput(resp.msg, resp.status)
            }
            else
            {
                if (this.responseText.length !== 0)
                    alert("Ajax Error:\n" + this.responseText);
                else
                    alert("Ajax Error\nPlease check if your SERVER is running.");
            }
            document.body.style.cursor = 'default';
        }
    };

    request.upload.addEventListener('progress', function(e){
        progress.style.width = Math.ceil((e.loaded / e.total) * 100) + '%';
    }, false);

    request.open('POST', url);
    // Browser automatically set "Content-Type" header:
    //request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
    request.send(data);
}

function str2HexStr(hex)
{
    return hex.split('').map(function(c)
    {
        i = c.charCodeAt(0); // Unicode16 
        if (i < 256)
            return i.toString(16);
        else
            return '3F'; // Strict ASCII encoding transformation - ASCII code 0x3F is for '?'
        /*/ Encoding("windows-1250") for Serbian characters only:
        switch (i)
        {
            
            case 352: return '8A'; break; // Š
            case 272: return 'D0'; break; // Đ
            case 268: return 'C8'; break; // Č
            case 262: return 'C6'; break; // Ć
            case 381: return '8E'; break; // Ž
            case 353: return '9A'; break; // š
            case 273: return 'F0'; break; // đ
            case 269: return 'E8'; break; // č
            case 263: return 'E6'; break; // ć
            case 382: return '9E'; break; // ž
            default: return (i & 0xFF).toString(16);
        }
        */
    }).join("");
}

function Hex2Base64(hexstring)
{

    return btoa(hexstring.match(/\w{2}/g).map(function(a)
    {
        return String.fromCharCode(parseInt(a, 16));
    }).join(""));
}

function PerformHex2Base64()
{
    document.getElementById("res_disp").value = Hex2Base64(document.getElementById("res_disp").value);
    return;
}

function rawResponseToObject(arg)
{
	var temp = JSON.parse(arg);
	//var temp = arg.split('<dl_br>');

    var res = {
        //status : temp[0].split('<dl_eq>')[1],
        //msg : temp[1].split('<dl_eq>')[1]
    	status : temp.status,
    	msg : temp.msg
    }
    return res;
}

function clearStatus()
{
    var dl_status = document.getElementById("dl_status")
    dl_status.value = "";
    dl_status.style.backgroundColor = "White";
}

function clearOutput()
{
    var dl_output = document.getElementById("output_msg")
    dl_output.innerHTML = "";
    //dl_output.value = "";
    //dl_output.style.backgroundColor = "White";
}

function setStatus(arg)
{
    var status = document.getElementById("dl_status")
    status.value = arg;
    if ((arg == "OK") || (arg == "PDF Signature is VALID"))
        status.style.backgroundColor = "LightGreen";
    else
        status.style.backgroundColor = "MistyRose";
}

function setOutput(arg, status)
{
	var dl_output = document.getElementById("output_msg")
	//dl_output.value = arg;
	dl_output.innerHTML = arg;
/*
    if (status == "OK")
    	dl_output.style.backgroundColor = "LightGreen";
    else
    	dl_output.style.backgroundColor = "MistyRose";
*/
}

function GetXmlHttpObject()
{
    var xmlHttp = null;

    try
    {
        xmlHttp = new XMLHttpRequest();
    }
    catch (e)
    {
        try
        {
            // code for old IE browsers
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e)
        {
            // code for oldest IE browsers
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
    }
    return xmlHttp;
}

function hexToBytes(hex)
{
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function splitAtEvery(hex)
{
    var arr = [];
    for (var i = 0; i < hex.length; i += 2)
    {
        arr.push(hex.substr(i, 2));
    }
    return arr;
}

function parseHexString(str)
{
    var result = [];
    while (str.length >= 8)
    {
        result.push(parseInt(str.substring(0, 8), 16));

        str = str.substring(8, str.length);
    }
    return result;
}

function buttonsEnableDisable() {
	var agreement = document.getElementById("agreement");
	var pem_file = document.getElementById("pem_file");
	var pdf_file = document.getElementById("pdf_file");
	var btnClearOutput = document.getElementById("btnClearOutput");
	var l_pem_file = document.getElementById("l_pem_file");
	var l_pdf_file = document.getElementById("l_pdf_file");
	
	if (agreement.checked) {
		// Buttons enable:
		pem_file.disabled = false;
		pdf_file.disabled = false;
		btnClearOutput.disabled = false;
		
		l_pem_file.style.cursor = "pointer";
		l_pdf_file.style.cursor = "pointer";
	} else {
		// Buttons disable:
		pem_file.disabled = true;
		pdf_file.disabled = true;
		btnClearOutput.disabled = true;
		
		l_pem_file.style.cursor = "not-allowed";
		l_pdf_file.style.cursor = "not-allowed";
	}
}

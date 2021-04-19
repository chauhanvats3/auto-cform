function enterData() {
    let selectOption = (options, matchTo) => {
        for (let i = 0; i < options.length; i++) {
            if (options[i].innerHTML.trim().toLowerCase() === matchTo.toLowerCase())
                options[i].selected = true;
        }
    }

    let lessThanTen = (str) => {
        if (parseInt(str) < 10)
            return `0${str}`
        else return `${str}`
    }

    chrome.storage.local.get(['cformData'], function (result) {
        let cformData = JSON.parse(result.cformData);
        let date;

        console.log(cformData)
        let { basic, misc, visa, passport } = cformData;
        document.getElementById("applicant_surname").value = basic.l_name;
        document.getElementById("applicant_givenname").value = basic.f_name;
        selectOption(document.getElementById("applicant_sex").children, basic.sex);

        document.getElementsByName("dobformat")[0].children[1].selected = true;

        dob_obj = new Date(basic.dob);
        let date_str = `${lessThanTen(dob_obj.getDate())}/${lessThanTen(dob_obj.getMonth())}/${dob_obj.getFullYear()}`
        document.getElementById("applicant_dob").value = date_str;



        /* const script = document.createElement('script')
        console.log(chrome.runtime.getURL('static/validateDOBFormat.js'));
        script.src = chrome.runtime.getURL('static/validateDOBFormat.js')
        document.documentElement.appendChild(script) */

    });
    return "Injected";

}




chrome.extension.onConnect.addListener(function (port) { //Listen to any incoming messages
    port.onMessage.addListener(function (msg) {

        chrome.storage.local.set({ 'cformData': msg.cformData }, function () {

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                var currTab = tabs[0];
                if (currTab) {
                    const tabId = currTab.id;

                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId, allFrames: true },
                            function: enterData,
                        },
                        (injectionResults) => {
                            for (const frameResult of injectionResults)
                                console.log('Result of Injection: ' + frameResult.result);
                        });
                }
            });
        });
    })
})
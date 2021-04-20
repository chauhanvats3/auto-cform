function enterData() {

    let selectOption = (parentId, matchTo) => {
        let options = document.getElementById(parentId).children;
        for (let i = 0; i < options.length; i++) {
            if (options[i].innerHTML.trim().toLowerCase() === matchTo.trim().toLowerCase()) {

                options[i].selected = true;
                var event = new Event('change');
                options[i].parentElement.dispatchEvent(event);

                return;
            }
        }
    }

    let lessThanTen = (str) => {
        if (parseInt(str) < 10)
            return `0${str}`
        else return `${str}`
    }

    let getFormattedDate = (date_obj) => {
        return `${lessThanTen(date_obj.getDate())}/${lessThanTen(date_obj.getMonth())}/${date_obj.getFullYear()}`
    }

    let handleDerivedSelect = (parentId, parentMatchTo, childId, childMatchTo) => {

        let parent = document.getElementById(parentId)
        let child = document.getElementById(childId)



        if (parent.selectedOptions[0].innerHTML.trim().toLowerCase() !== parentMatchTo.trim().toLowerCase()) {
            //if (parent.selectedOptions[0].innerHTML.trim().toLowerCase() === "select" && parent.selectedIndex === 0)
            selectOption(parent.id, parentMatchTo);
            /*  else
                 selectOption(child.id, childMatchTo); */

        } else {
            selectOption(child.id, childMatchTo);
        }
    }

    let setDateInput = (id, dateStr) => {
        let element = document.getElementById(id)
        let date = dateStr ? new Date(dateStr) : new Date(new Date().setMonth(new Date().getMonth() + 1));
        element.value = getFormattedDate(date);
    }

    let setTextInput = (id, str) => {
        let element = document.getElementById(id);
        element.value = str;
    }

    let setRadioInput = (name, value) => {
        let options = document.getElementsByName(name);
        for (let i = 0; i < options.length; i++) {
            if (options[i].nextSibling.textContent.trim().toLowerCase() === value.trim().toLowerCase()) {
                options[i].checked = true;
                var event = new Event('click');
                options[i].dispatchEvent(event);
                return
            }
        }
    }

    let setAllData = (cformData) => {
        let { basic, misc, visa, passport, ref } = cformData;

        setTextInput("applicant_surname", basic.l_name)
        setTextInput("applicant_givenname", basic.f_name)
        selectOption("applicant_sex", basic.sex);

        document.getElementsByName("dobformat")[0].children[1].selected = true;

        /* ------------------SET Date Of Birth--------------------- */
        setDateInput("applicant_dob", basic.dob);
        var event = new Event('blur');
        document.getElementById("applicant_dob").dispatchEvent(event);
        /* -------------------------------------------------------- */

        selectOption("applicant_special_category", basic.sp_cat);
        selectOption("applicant_nationality", basic.nationality);

        setTextInput("applicant_permaddr", basic.address)
        setTextInput("applicant_permcity", basic.city)

        selectOption("applicant_permcountry", basic.country);

        /* ------------Setting Reference Address--------------------------- */
        setTextInput("applicant_refaddr", ref.add)
        handleDerivedSelect("applicant_refstate", ref.state, "applicant_refstatedistr", ref.dist);
        setTextInput("applicant_refpincode", ref.pin);
        /* --------------------------------------------------------------- */


        /* -------------Passport--------------- */
        setTextInput("applicant_passpno", passport.number);
        setTextInput("applicant_passplcofissue", passport.city);
        selectOption("passport_issue_country", passport.country);
        setDateInput("applicant_passpdoissue", passport.issue);
        setDateInput("applicant_passpvalidtill", passport.expiry);
        /* ------------------------------------ */

        /* -------------Visa--------------- */
        setTextInput("applicant_visano", visa.number);
        setTextInput("applicant_visaplcoissue", visa.city);
        selectOption("visa_issue_country", visa.country);
        setDateInput("applicant_visadoissue", visa.issue);
        setDateInput("applicant_visavalidtill", visa.expiry);
        handleDerivedSelect("applicant_visatype", visa.type, "applicant_visa_subtype_code", visa.sub_type);
        /* ------------------------------------ */


        /* -----------------Miscellaneous------------------ */
        selectOption("applicant_arrivedfromcountry", misc.arrival.country)
        setTextInput("applicant_arrivedfromcity", misc.arrival.city)
        setTextInput("applicant_arrivedfromplace", misc.arrival.place)
        setDateInput("applicant_doarrivalindia", misc.arrival.date);
        setDateInput("applicant_doarrivalhotel", "");
        setTextInput("applicant_timeoarrivalhotel", "11:00")
        setTextInput("applicant_intnddurhotel", misc.intended_stay)
        setRadioInput("employed", misc.employed)
        selectOption("applicant_purpovisit", misc.purpose)

        if (misc.next_destination.india === "Yes") {

            setRadioInput("applicant_next_dest_country_flag_r", "Inside India")
            handleDerivedSelect("applicant_next_destination_state_IN", misc.next_destination.state, "applicant_next_destination_city_district_IN", misc.next_destination.district);
            setTextInput("applicant_next_destination_place_IN", misc.next_destination.place)

        } else {

            setRadioInput("applicant_next_dest_country_flag_r", "Outside India")
            selectOption("applicant_next_destination_country_OUT", misc.next_destination.country)
            setTextInput("applicant_next_destination_city_OUT", misc.next_destination.city)
            setTextInput("applicant_next_destination_place_OUT", misc.next_destination.place)
        }

        setTextInput("applicant_contactnoinindia", misc.contact_info.indian_number)
        setTextInput("applicant_contactnoperm", misc.contact_info.permanent_number)

        /* ------------------------------------------------ */
    }

    chrome.storage.local.get(['cformData'], function (result) {

        /* ------------------ Setup Variables--------------------- */
        let cformData = JSON.parse(result.cformData);
        console.log(cformData)
        /* ------------------------------------------------------- */
        chrome.storage.sync.get({
            address: "",
            state: "",
            district: "",
            pin: ""
        }, function (items) {
            cformData["ref"] = {}
            cformData.ref.add = items.address
            cformData.ref.state = items.state
            cformData.ref.dist = items.district
            cformData.ref.pin = items.pin

            setAllData(cformData)

        });
    });

    return "Injected";
}




chrome.runtime.onConnect.addListener(function (port) { //Listen to any incoming messages
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
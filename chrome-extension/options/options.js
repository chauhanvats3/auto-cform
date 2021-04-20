let btnSave = document.getElementsByClassName("save")[0]
let btnReset = document.getElementsByClassName("reset")[0]
let toast = document.getElementsByClassName("toast")[0]
let add_input = document.getElementById("add")
let state_input = document.getElementById("state")
let dist_input = document.getElementById("dist")
let pin_input = document.getElementById("pin")

let saveOptions = () => {
    let address = add_input.value
    let state = state_input.value
    let district = dist_input.value
    let pin = pin_input.value

    chrome.storage.sync.set({
        address: address,
        state: state,
        district: district,
        pin: pin
    }, function () {

        // Update status to let user know options were saved.
        toast.innerText = "Settings Saved"
        toast.classList.add("show")
        setTimeout(() => {
            toast.classList.remove("show")
        }, 2000);
    });
}

function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        address: "",
        state: "",
        district: "",
        pin: ""
    }, function (items) {
        add_input.value = items.address
        state_input.value = items.state
        dist_input.value = items.district
        pin_input.value = items.pin
    });
}

let resetOptions = () => {
    add_input.value = ""
    state_input.value = ""
    dist_input.value = ""
    pin_input.value = ""

    chrome.storage.sync.set({
        address: add_input.value,
        state: state_input.value,
        district: dist_input.value,
        pin: pin_input.value
    }, function () {

        // Update status to let user know options were reset.
        toast.innerText = "Settings Reset"
        toast.classList.add("show")
        setTimeout(() => {
            toast.classList.remove("show")
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', restore_options);

btnSave.addEventListener('click', (e) => {
    saveOptions()
})

btnReset.addEventListener('click', (e) => {
    resetOptions()
})
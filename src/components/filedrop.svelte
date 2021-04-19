<script>
    import { onMount } from 'svelte'
    import { cformData } from '../stores.js';
    let fileInput, files, dropArea, warning;

    onMount(() => {
        ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false)
        })

        function preventDefaults(e) {
            e.preventDefault()
            e.stopPropagation()
        }

        ;['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false)
        })

            ;['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false)
            })

        function highlight(e) {
            dropArea.classList.add('highlight')
        }

        function unhighlight(e) {
            dropArea.classList.remove('highlight')
        }

        dropArea.addEventListener('drop', handleDrop, false)

        function handleDrop(e) {
            let dt = e.dataTransfer
            files = dt.files
            handleFiles()
        }

    });

    let handleChange = () => {
        files = fileInput.files;
        handleFiles();
    }


    let handleFiles = async () => {
        if (files[0].type !== "application/json") {
            warning.classList.add('show')
            return;
        } else {
            warning.classList.remove('show')
        }
        let text = await files[0].text();
        cformData.set(text);
        postMessageToBackground($cformData)
    }

    let postMessageToBackground = (data) => {
        var port = chrome.extension.connect({ //Create  a port to connect with background.js
            name: "Inject CForm Data"
        });
        port.postMessage({ //message background script to do something
            cformData: data
        });
    }

</script>

<div class="drop-area" id="drop-area" on:click={fileInput.click()} bind:this={dropArea}>
    <form class="my-form">
        <p class="info">Drop CForm JSON File Here</p>

        <input type="file" id="fileElem" accept=".json" on:change={handleChange} bind:this={fileInput}
            bind:files={files}>
    </form>
</div>
<div class="warning" bind:this={warning}>
    <p>
        Only JSON Files Are Supported!
    </p>
</div>


<style>
    .drop-area {
        min-width: 200px;
        min-height: 100px;
        border: 1px dashed black;
        margin: 5px;
        cursor: pointer;
        border-radius: 7px;
        position: relative;
    }

    :global(.drop-area.highlight) {
        border-color: purple;
    }

    .info {
        font-family: 'julius sans one';
        width: 100%;
        text-align: center;
    }

    .warning {
        width: 100%;
        height: 0px;
        overflow: hidden;
        transition: all .5s ease;

    }

    .warning p {
        color: red;
        font-family: 'quicksand';
        text-align: center;
        padding: 1px 5px;
        width: 100%;
    }

    :global(.warning.show) {
        height: 45px !important;
    }

    #fileElem {
        display: none;
    }
</style>
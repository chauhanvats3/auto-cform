<script>
    import { onMount } from 'svelte'
    import { cformData } from '../stores.js';
    let fileInput, files, dropArea;

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
        console.log("Dropped")
        let text = await files[0].text();
        cformData.set(text);
    }

</script>

<div class="drop-area" id="drop-area" on:click={fileInput.click()} bind:this={dropArea}>
    <form class="my-form">
        <p>Drop CForm File Here</p>
        <input type="file" id="fileElem" accept=".json" on:change={handleChange} bind:this={fileInput}
            bind:files={files}>
    </form>
</div>


<style>
    .drop-area {
        min-width: 200px;
        min-height: 100px;
        border: 1px dashed black;
        margin: 5px;
        cursor: pointer;
        border-radius: 7px;
    }

    :global(.drop-area.highlight) {
        border-color: purple;
    }

    p {
        font-family: 'julius sans one';
        width: 100%;

    }

    #fileElem {
        display: none;
    }
</style>
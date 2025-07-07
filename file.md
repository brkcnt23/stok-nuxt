nuxt-file-storage
Easy solution to store files in your nuxt apps. Upload files from the frontend and recieve them from the backend to save the files in your project.
2.7K downloads
•
95 stars
•
v0.3.0
NyllRE
Nuxt File Storage Banner

Nuxt File Storage
Visits Badge npm version npm downloads License Nuxt

Easy solution to store files in your nuxt apps. Be able to upload files from the frontend and receive them from the backend to then save the files in your project.

✨  Release Notes
🏀 Online playground
Features
📁  Get files from file input and make them ready to send to backend
⚗️  Serialize files in the backend to be able to use them appropriately
🖴  Store files in a specified location in your Nuxt backend with Nitro Engine
Quick Setup
Add nuxt-file-storage dependency to your project

# Using pnpm
pnpm add -D nuxt-file-storage

# Using yarn
yarn add --dev nuxt-file-storage

# Using npm
npm install --save-dev nuxt-file-storage
Add nuxt-file-storage to the modules section of nuxt.config.ts

export default defineNuxtConfig({
    modules: ['nuxt-file-storage'],
})
That's it! You can now use Nuxt Storage in your Nuxt app ✨

Configuration
You can currently configure a single setting of the nuxt-file-storage module. Here is the config interface:


export default defineNuxtConfig({
    modules: ['nuxt-file-storage'],
    fileStorage: {
        // enter the absolute path to the location of your storage
        mount: '/home/$USR/development/nuxt-file-storage/server/files',

        // {OR} use environment variables (recommended)
        mount: process.env.mount
        // you need to set the mount in your .env file at the root of your project
    },
})
Usage
Handling Files in the frontend
You can use Nuxt Storage to get the files from the <input> tag:


<template>
    <input type="file" @input="handleFileInput" />
</template>

<script setup>
    // handleFileInput can handle multiple files
    // clearOldFiles: true by default, each time the user adds files the `files` ref will be cleared
    const { handleFileInput, files } = useFileStorage({ clearOldFiles: false })
</script>
The files return a ref object that contains the files

handleFileInput returns a promise in case you need to check if the file input has concluded


Here's an example of using files to send them to the backend


<template>
    <input type="file" @input="handleFileInput" />
    <button @click="submit">submit</button>
</template>

<script setup>
const { handleFileInput, files } = useFileStorage()

const submit = async () => {
    const response = await $fetch('/api/files', {
        method: 'POST',
        body: {
            files: files.value
        }
    })
}
</script>

Handling multiple file input fields
You have to create a new instance of useFileStorage for each input field


<template>
    <input type="file" @input="handleFileInput" multiple />   ← | 1 |
    <input type="file" @input="profileInputHandler" />                 ← | 2 |
</template>

<script setup>
    const { handleFileInput, files } = useFileStorage()       ← | 1 |

    const {
        handleFileInput: profileInputHandler,
        files: profileImage
    } = useFileStorage()                                               ← | 2 |
</script>
by calling a new useFileStorage instance you separate the internal logic between the inputs

Handling files in the backend
using Nitro Server Engine, we will make an api route that receives the files and stores them in the folder userFiles


import { ServerFile } from "nuxt-file-storage";

export default defineEventHandler(async (event) => {
    const { files } = await readBody<{ files: ServerFile[] }>(event)

    for ( const file of files ) {
        await storeFileLocally(
            file,         // the file object
            8,            // you can add a name for the file or length of Unique ID that will be automatically generated!
            '/userFiles'  // the folder the file will be stored in
        )

        // {OR}

        // Parses a data URL and returns an object with the binary data and the file extension.
        const { binaryString, ext } = parseDataUrl(file.content)
    }

    // Deleting Files
    await deleteFile('requiredFile.txt', '/userFiles')

    // Get file path
    await getFileLocally('requiredFile.txt', '/userFiles')
    // returns: {AbsolutePath}/userFiles/requiredFile.txt

    // Get all files in a folder
    await getFilesLocally('/userFiles')
})
And that's it! Now you can store any file in your nuxt project from the user ✨

Contribution
Run into a problem? Open a new issue. I'll try my best to include all the features requested if it is fitting to the scope of the project.

Want to add some feature? PRs are welcome!

Clone this repository
install the dependencies
prepare the project
run dev server

git clone https://github.com/NyllRE/nuxt-file-storage && cd nuxt-file-storage
npm i
npm run dev:prepare
npm run dev
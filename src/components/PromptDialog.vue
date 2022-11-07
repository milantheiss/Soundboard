<template>
    <TransitionRoot as="template" :show="open">
        <Dialog as="div" class="relative z-10" @close="open = false">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 z-10 overflow-y-auto">
                <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <TransitionChild as="template" enter="ease-out duration-300"
                        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 sm:scale-100"
                        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                        <DialogPanel
                            class="relative transform overflow-hidden rounded-lg bg-background text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                            <div class="bg-inherit px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div class="sm:flex sm:items-start">
                                    <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <DialogTitle as="h3" class="text-lg font-medium leading-6 text-white">{{header}}</DialogTitle>
                                        <div class="mt-2">
                                            <p class="text-sm text-gray-200">{{text}}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-inherit px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 text-white">
                                <TextInput v-model="input"></TextInput>
                            </div>
                            <div class="bg-inherit px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="button"
                                    class="inline-flex w-full justify-center rounded-md border border-transparent bg-electric-blue px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="ok">Erstellen</button>
                                <button type="button"
                                    class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-500 px-4 py-2 text-base font-medium text-gray-100 hover:bg-gray-300 hover:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    @click="this.open = false" ref="cancelButtonRef">Abbrechen</button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import TextInput from './TextInput.vue';



export default {
    name: "PromptDialog",
    expose: ['open'],
    components: {
        // eslint-disable-next-line vue/no-reserved-component-names
        Dialog,
        DialogPanel,
        DialogTitle,
        TransitionChild,
        TransitionRoot,
        TextInput
    },
    props:{
        header: String,
        text: String
    },
    data() {
        return {
            open: false,
            input: undefined
        }
    },
    methods: {
        ok(){
            this.open = false
            this.$emit('onCommit', this.input)
            this.input = undefined
        }
    },
}
</script>
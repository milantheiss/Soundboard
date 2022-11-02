<template>
    <input class="block
                        w-full
                        px-1.5 py-0.5
                        text-inherit text-lg md:text-xl
                        placeholder:text-gray-200
                        focus:outline-none
                        bg-inherit
                        border-0 border-b-2 border-white rounded-none"
        :type="type" :name="name" v-model="input" :placeholder="placeholder" />
</template>

<script>
export default {
    name: "TextInput",
    data() {
        return {
            input: this.modelValue,
        };
    },
    props: {
        modelValue: String,
        placeholder: {
            type: String,
            default: "Eingabe"
        },
        name: String,
        type: {
            type: String,
            required: false,
            default: 'text'
        }
    },
    emits: ['update:modelValue', 'onChange', 'on'],
    watch: {
        input() {
            this.$emit('update:modelValue', this.input)
        }
    }
};
</script>
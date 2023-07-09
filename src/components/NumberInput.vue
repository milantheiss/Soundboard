<template>
	<input
		class="block w-full px-1.5 py-0.5 text-inherit text-lg md:text-xl placeholder:text-gray-200 focus:outline-none focus:border-electric-blue-hover bg-inherit border-0 border-b-2 border-electric-blue rounded-none invalid:border-special-red"
		type="number"
		:name="name"
		v-model="input"
		:placeholder="placeholder"
		:max="max"
		:min="min"
		:step="step" />
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
		modelValue: Number,
		placeholder: {
			type: String,
			default: "Eingabe",
		},
		name: String,
		type: {
			type: String,
			required: false,
			default: "text",
		},
		max: String,
		min: String,
		step: Number,
	},
	emits: ["update:modelValue", "onChange", "on"],
	watch: {
		input() {
			this.$emit("update:modelValue", this.input);
		},
		modelValue() {
			this.input = this.modelValue;
		},
	},
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
	opacity: 0;
}

input[type="number"] {
	background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='white'%3e%3cpath d='m24 30.8-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z'/%3e%3c/svg%3e"),
		url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='white'%3e%3cpath d='M14.15 30.15 12 28l12-12 12 12-2.15 2.15L24 20.3Z'/%3e%3c/svg%3e");
	background-repeat: no-repeat, no-repeat;
	background-size: 1.9rem, 1.9rem;
	background-position: top 7px right, bottom 7px right;
}

input::-webkit-date-and-time-value {
	text-align: left;
}
</style>

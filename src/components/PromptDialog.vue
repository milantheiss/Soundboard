<template>
	<TransitionRoot as="template" :show="open">
		<Dialog as="div" class="relative z-10" @close="open = false">
			<TransitionChild
				as="template"
				enter="ease-out duration-300"
				enter-from="opacity-0"
				enter-to="opacity-100"
				leave="ease-in duration-200"
				leave-from="opacity-100"
				leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 overflow-y-auto">
				<div class="flex min-h-full justify-center items-center">
					<TransitionChild
						as="template"
						enter="ease-out duration-300"
						enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
						enter-to="opacity-100 translate-y-0 sm:scale-100"
						leave="ease-in duration-200"
						leave-from="opacity-100 translate-y-0 sm:scale-100"
						leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
						<DialogPanel class="relative transform overflow-hidden rounded-lg bg-background text-left shadow-xl p-6 min-w-fit flex flex-col gap-6">
							<div class="flex flex-col gap-1">
								<DialogTitle as="h2" class="text-xl font-medium leading-6 text-white">{{ header }}</DialogTitle>
								<p class="text-base text-gray-200">{{ text }}</p>
								<span class="text-white">
									<TextInput v-model="input" class=""></TextInput>
								</span>
								<p class="font-medium text-special-red mt-2" v-show="errorText.length > 0">{{ errorText }}</p>
							</div>
							<div class="bg-inherit flex gap-6">
								<button
									type="button"
									class="inline-flex w-full justify-center px-10 py-2 rounded-md border border-transparent bg-gray-500 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 shadow-sm text-base font-medium text-gray-100 sm:text-lg hover:text-gray-500"
									@click="
										{
											this.open = false;
											this.$emit('onCancel');
											this.input = '';
											this.errorText = '';
										}
									"
									ref="cancelButtonRef">
									Cancel
								</button>
								<button
									type="button"
									class="inline-flex w-full justify-center px-10 py-2 rounded-md border border-transparent bg-electric-blue hover:bg-electric-blue-hover focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 shadow-sm text-base font-medium text-black sm:text-lg"
									@click="ok">
									Create
								</button>
							</div>
						</DialogPanel>
					</TransitionChild>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import TextInput from "./TextInput.vue";

export default {
	name: "PromptDialog",
	expose: ["open"],
	components: {
		// eslint-disable-next-line vue/no-reserved-component-names
		Dialog,
		DialogPanel,
		DialogTitle,
		TransitionChild,
		TransitionRoot,
		TextInput,
	},
	props: {
		header: String,
		text: String,
		validatorRegex: {
			type: RegExp,
			default: /[\s\S]/g,
			required: false,
		},
	},
	data() {
		return {
			open: false,
			input: "",
			errorText: "",
		};
	},
	methods: {
		ok() {
			//Regex everything allowed
			//Regex:
			if (this.input.length === 0) {
				this.errorText = "Input is empty!";
				return;
			}
			if (!this.validatorRegex.test(this.input)) {
				this.errorText = "Input contains invalid characters!";
				return;
			}
			this.$emit("onCommit", this.input);
			this.open = false;
			this.input = "";
			this.errorText = "";
		},
	},
};
</script>

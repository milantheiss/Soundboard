<template>
	<div
		class="fixed z-50 outline-none cursor-pointer text-lg rounded-lg drop-shadow-md bg-white text-black p-2"
		v-show="show"
		:style="style"
		ref="context"
		tabindex="0"
		@blur="close">
		<slot></slot>
	</div>
</template>
<script>
export default {
	name: "ContextMenu",
	props: {
		display: Boolean, // prop detect if we should show context menu
	},
	data() {
		return {
			left: 0, // left position
			top: 0, // top position
			show: false, // affect display of context menu
		};
	},
	computed: {
		// get position of context menu
		style() {
			return {
				top: this.top + "px",
				left: this.left + "px",
			};
		},
	},
	methods: {
		// closes context menu
		close() {
			this.show = false;
			this.left = 0;
			this.top = 0;
		},
		open(evt) {
			evt.preventDefault();
			// updates position of context menu
			this.left = evt.pageX || evt.clientX;
			this.top = evt.pageY || evt.clientY;

			this.show = true;
		},
	},
};
</script>

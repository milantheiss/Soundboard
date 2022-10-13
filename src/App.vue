<template class="font-poppins font-normal">
  <SoundeffectButton :soundeffect="soundeffects[0]"></SoundeffectButton>
  <HowlerPlayer></HowlerPlayer>
</template>

<script>
//import BetterPlayer from './components/BetterPlayer.vue';
import HowlerPlayer from './components/HowlerPlayer.vue';
import SoundeffectButton from './components/SoundeffectButton.vue';
export default {
  data() {
    return {
      soundeffects: [
        {
          name: "Zelda Chest",
          src: "./soundeffects/Zelda Open Chest.mp3",
          trackvolume: 0.5,
          isLooping: true,
          fadeOutDuration: 1000,
          fadeInDuration: 0
        }
      ]
    }
  },
  components: {
    HowlerPlayer,
    SoundeffectButton
  }
}
</script>
  
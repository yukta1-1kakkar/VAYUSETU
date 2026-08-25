// Silent stub to ensure completely sound-free operation as required
class SilentSoundSystem {
  public enabled: boolean = false;
  public toggle(): boolean { return false; }
  public playHover() {}
  public playClick() {}
  public playAlert() {}
  public playBeep() {}
}

export const soundFx = new SilentSoundSystem();

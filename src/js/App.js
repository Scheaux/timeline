import moment from 'moment-timezone';

export default class App {
  init() {
    this.initListeners();
  }

  initListeners() {
    this.addMessageInputListener();
    this.addManualLocationInput();
    this.addAudioRecording();
    this.audioControl();
  }

  addMessageInputListener() {
    const input = document.getElementById('send-message');
    input.addEventListener('keypress', (e) => {
      if (input.value === '') return;
      if (e.key === 'Enter') {
        navigator.geolocation.getCurrentPosition((evt) => {
          if (!evt.coords) return;
          const { latitude, longitude } = evt.coords;
          App.renderMessage(latitude, longitude, input.value);
          input.value = '';
        }, () => {
          this.message = input.value;
          input.value = '';
          const modal = document.getElementById('confirm-location');
          modal.classList.remove('hidden');
        });
      }
    });
  }

  static render(latitude, longitude, date, element) {
    const postContainer = document.getElementById('post-container');
    const post = document.createElement('div');
    const postDate = document.createElement('span');
    const postLocation = document.createElement('span');
    post.className = 'post';
    postDate.className = 'post_date';
    postLocation.className = 'post_location';
    postDate.innerText = date;
    postLocation.innerText = `[${latitude}, ${longitude}]`;
    post.append(postDate);
    post.append(element);
    post.append(postLocation);
    postContainer.insertAdjacentElement('afterbegin', post);
  }

  static renderMessage(latitude, longitude, message) {
    const postText = document.createElement('span');
    postText.className = 'post_text';
    postText.innerText = message;
    const date = moment().format('DD.MM.YY kk:mm');
    App.render(latitude, longitude, date, postText);
  }

  static renderAudioPost(latitude, longitude, url) {
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    const date = moment().format('DD.MM.YY kk:mm');
    App.render(latitude, longitude, date, audio);
  }

  static createAudioPost(url) {
    navigator.geolocation.getCurrentPosition((evt) => {
      if (!evt.coords) return;
      const { latitude, longitude } = evt.coords;
      App.renderAudioPost(latitude, longitude, url);
    }, () => {
      const modal = document.getElementById('confirm-location');
      modal.classList.remove('hidden');
    });
  }

  addManualLocationInput() {
    const modal = document.getElementById('confirm-location');
    const input = modal.querySelector('.modal_input');
    const okBtn = modal.querySelector('.modal_ok');
    const cancelBtn = modal.querySelector('.modal_cancel');
    okBtn.addEventListener('click', () => {
      const validationResult = App.validateCoordinates(input.value);
      if (validationResult) {
        const { latitude, longitude } = validationResult;
        if (this.message) {
          App.renderMessage(latitude, longitude, this.message);
          this.message = null;
        }
        if (this.audioURL) {
          App.renderAudioPost(latitude, longitude, this.audioURL);
          this.audioURL = null;
        }
        modal.classList.add('hidden');
        input.value = '';
      } else {
        const error = modal.querySelector('.modal_error');
        error.classList.add('shake');
        error.classList.remove('fade_out');
        error.addEventListener('animationend', () => {
          error.classList.add('fade_out');
          error.classList.remove('shake');
        });
      }
    });
    cancelBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  static validateCoordinates(coords) {
    if (coords.split(',').length !== 2) return null;
    const noSpace = coords.replace(' ', '');
    let split = noSpace.split(',');

    if (coords[0] === '[' && coords[coords.length - 1] === ']') {
      split = noSpace.slice(1, noSpace.length - 1).split(',');
      if (Number.isNaN(+split[0]) || Number.isNaN(+split[1])) return null;
      return { latitude: +split[0], longitude: +split[1] };
    }
    if (+split[0] && +split[1]) {
      return { latitude: +split[0], longitude: +split[1] };
    }

    return null;
  }

  addAudioRecording() {
    const mic = document.getElementById('mic');
    const audioControls = document.querySelector('.audio_controls');
    mic.addEventListener('click', async () => {
      if (!window.MediaRecorder) return;
      audioControls.classList.remove('hidden');
      mic.classList.add('hidden');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.recorder = new MediaRecorder(stream);
      const chunks = [];
      this.recorder.addEventListener('start', () => {
        this.startAudioInterval();
      });
      this.recorder.addEventListener('dataavailable', (evt) => {
        if (this.saveAudio === true) {
          chunks.push(evt.data);
          const blob = new Blob(chunks);
          this.audioURL = URL.createObjectURL(blob);
          App.createAudioPost(this.audioURL);
        }
      });
      this.recorder.addEventListener('stop', () => {
        stream.getTracks().forEach((x) => x.stop());
      });
      this.recorder.start();
    });
  }

  audioControl() {
    const mic = document.getElementById('mic');
    const audioControls = document.querySelector('.audio_controls');
    const save = audioControls.querySelector('.audio_save');
    const cancel = audioControls.querySelector('.audio_cancel');
    cancel.onclick = () => {
      this.recorder.stop();
      audioControls.classList.add('hidden');
      mic.classList.remove('hidden');
      clearInterval(this.audioInterval);
      this.saveAudio = false;
    };
    save.onclick = () => {
      this.recorder.stop();
      audioControls.classList.add('hidden');
      mic.classList.remove('hidden');
      clearInterval(this.audioInterval);
      this.saveAudio = true;
    };
  }

  startAudioInterval() {
    const audioControls = document.querySelector('.audio_controls');
    const timer = audioControls.querySelector('.audio_timer');
    timer.innerText = '00:00';
    let seconds = 1;
    let minutes = 0;
    this.audioInterval = setInterval(() => {
      if (seconds < 10) {
        timer.innerText = `0${minutes}:0${seconds}`;
      } else if (seconds >= 10 && seconds < 60) {
        timer.innerText = `0${minutes}:${seconds}`;
      } else if (seconds >= 60) {
        minutes += 1;
        seconds = 0;
        timer.innerText = `0${minutes}:0${seconds}`;
      }
      seconds += 1;
    }, 1000);
  }
}

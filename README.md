# Silent Chant

Silent Chant is a silent karaoke software that allows users to 'sing' along to songs by moving their lips, without the necessity to produce any tone through their vocal tract. A vowel that the mouth shape would have likely produced is estimated. This information is then fed into a singing voice synthesizer that produces the corresponding vowel by adjusting a formant filter bank.
The user selects a midi file that controls the synthesizer's melody, accompanied by an additional audio playback track. This enables them to choose their favorite song and engage with it on a deeper level than merely listening to it. Especially in situations where singing out loud might be inappropriate, such as in public spaces or at work,  users are given the ability to bi-directionally interact with music. For additional expressivity, the user can control the vibrato rate of the synthesizer by pitching their head.

# Running the application

## Installation
Run `npm install`

- webpack is required and should be installed of the host computer
- npm is required to run

## Starting the application

Run `npm start` to start the webpack dev-server. The application will be hosted on `http://localhost:9000/` and should be accessible via a browser.
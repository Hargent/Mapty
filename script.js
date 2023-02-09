// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btn = document.querySelector('.form__btn');
const btnLogo = document.querySelector('.logo');

// Implementing Workout class

// import { v4 as uuidv4 } from 'uuid';

class Workout {
    date = new Date();

    id = (Date.now() + '').slice(-10);
    // clicks = 0


    constructor(coords, distance, duration) {
        this.coords = coords;//[lat,lng]
        this.distance = distance; //in km
        this.duration = duration;//in min

    }
    _setDescription() {

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}  ${this.date.getDate()}`;
    }
    // click() {
    //     this.clicks++
    // }
}
class Running extends Workout {
    type = 'running'
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration)

        this.cadence = cadence;
        this.calcPace()
        this._setDescription()
    }
    calcPace() {
        return this.pace = this.duration / this.distance//min/km
    }

}
class Cycling extends Workout {
    type = 'cycling'
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration)

        this.elevation = elevation;
        this.calcSpeed()
        this._setDescription()
    }
    calcSpeed() {
        return this.speed = this.distance / (this.duration / 60)//in km/h
    }

}

// =================Implementing App class=================//
class App {
    //
    #map;

    #mapEvent;

    #workouts = [];

    #mapZoomLevel = 13;
    #homeAddress;

    // #mapEvent
    constructor() {
        // getting user position
        this._getPosition();
        // get data from local storage
        this._getLocalStorage();
        // form handler
        form.addEventListener('submit', this._newWorkout.bind(this));
        // type of event selection toggler
        this._toggleElevationField();
        // input handler
        inputType.addEventListener('change', this._toggleElevationField.bind(this))
        // map movement handler
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
        // implementing home
        btnLogo.addEventListener('click', this._moveToHome.bind(this))
    }
    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
                alert('Could not get your current position');
            });
        }
    }
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        this.#homeAddress = position.coords
        console.log(
            `https://www.google.com/maps/@${latitude},${longitude},17z`
        );

        this.#map = L.map('map').setView([latitude, longitude], this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.#map);

        L.marker([latitude, longitude])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                })
            )
            .setPopupContent('Your current location')
            .openPopup();
        // handles map click
        this.#map.on('click', this._showForm.bind(this));
        this.#workouts.forEach(data => {

            this._renderWorkoutMarker(data);
        })
    }

    _showForm(mapE) {
        form.classList.remove('hidden');
        this.#mapEvent = mapE;
    }
    _hideForm() {
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
            '';
        form.style.display = 'none'
        form.classList.add('hidden');
        setTimeout(() => {

            form.style.display = 'grid'
        }, 1000)
    }
    _toggleElevationField(e) {

        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        e.preventDefault();

        // get data from form
        const type = inputType.value
        const distance = +inputDistance.value
        const duration = +inputDuration.value


        // create object
        const isValid = (...arr) => arr.every(item => Number.isFinite(item))
        const isPositive = (...arr) => arr.every(item => item > 0)
        // reset input

        let workout;
        // running
        if (type === "running") {
            const cadence = +inputCadence.value
            // validate data
            if (!isValid(distance, duration, cadence) ||
                !isPositive(distance, duration, cadence)) {

                return alert("Inputs have to be a positive number")
            }
            const { lat, lng } = this.#mapEvent.latlng;
            workout = new Running([lat, lng], distance, duration, cadence)

        }
        // cycling

        const { lat, lng } = this.#mapEvent.latlng;

        if (type === "cycling") {
            const elevation = +inputElevation.value

            // validate data
            if (!isValid(distance, duration, elevation) ||
                !isPositive(distance, duration)) {

                return alert("Inputs have to be a positive number")
            }
            workout = new Cycling([lat, lng], distance, duration)

        }

        // add object to workout array
        this.#workouts.push(workout)

        // Render marker on map
        this._renderWorkoutMarker(workout)

        // Render on list
        this._renderWorkout(workout)

        // form.classList.add('hidden');
        this._hideForm();

        // set local storage to all workouts
        this._setLocalStorage();

    }
    _renderWorkoutMarker(arg) {

        // Trying out icon change
        const LeafIcon = L.Icon.extend({
            options: {
                iconSize: [38, 45],

                iconAnchor: [20, 50],

                popupAnchor: [-3, -56],
            },
        });
        const mapIcon = new LeafIcon({ iconUrl: 'icon.png' });

        L.marker(arg.coords, { icon: mapIcon })
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${arg.type}-popup`,
                })
            )
            .setPopupContent(`${arg.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${arg.description}`)
            .openPopup();
    }
    _renderWorkout(workout) {
        let html = `
                <li class="workout workout--${workout.type}" data-id="${workout.id}" >
                    <h2 class="workout__title">${workout.description}</h2>
                    <div class="workout__details">
                        <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '⏱'}</span>
                        <span class="workout__value">${workout.distance}</span>
                        <span class="workout__unit">km</span>
                    </div>
                    <div class="workout__details">
                        <span class="workout__icon"></span>
                        <span class="workout__value">${workout.duration}</span>
                        <span class="workout__unit">min</span>
                    </div>
                `
        if (workout.type === 'running')
            // prettier ignore
            html += `
                    <div class="workout__details" >
                                    <span class="workout__icon">⚡️</span>
                                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                                    <span class="workout__unit">min/km</span>
                                </div>
                    <div class="workout__details">
                        <span class="workout__icon">🦶🏼</span>
                        <span class="workout__value">${workout.cadence}</span>
                        <span class="workout__unit">spm</span>
                    </div>
                </li> `

        if (workout.type === 'cycling')
            // prettier ignore
            html += `
                <div class="workout__details" >
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value">${workout.elevation}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li >
             `;

        form.insertAdjacentHTML('afterend', html)
    }
    _moveToPopup(e) {
        const workoutElement = e.target.closest('.workout')


        if (!workoutElement) return;


        const workout = this.#workouts.find(item =>

            item.id === workoutElement.dataset.id
        );




        this.#map.setView(workout.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        });
        // using public interface
        // workout.click()
    }
    // local storage setting
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts))
    }
    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if (!data) return
        this.#workouts = data;
        this.#workouts.forEach(data => {

            this._renderWorkout(data);
        })
    }


    _moveToHome(e) {

        const home = [this.#homeAddress.latitude, this.#homeAddress.longitude]

        this.#map.setView(home, this.#mapZoomLevel + 5, {
            animate: true,
            pan: {
                duration: 1
            }
        });

    }

    // Public api //
    reset() {
        localStorage.removeItem('workouts')
        location.reload();
    }
}


// creating object with class App
const app = new App();




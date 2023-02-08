// prettier-ignore
import uuidv4 from "uuid/v4";

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const btn = document.querySelector('.form__btn');



// Implementing Workout class
class Workout {
    date = new Date();
    id = uuidv4();
    constructor(coords, distance, duration) {
        coords = coords;
        distance = distance; //in km
        duration = duration;//in min
    }
}
class Running extends Workout {
    constructor(cadence, distance, coords)
    cadence = cadence;
    coords = coords;
    distance = distance; //in km

}
class Cycling extends Workout {
    constructor(cadence, distance, coords)
    cadence = cadence;
    coords = coords;
    distance = distance; //in km

}
// Implementing App class
class App {
    //
    #map;

    #mapEvent;



    // #mapEvent
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        this._toggleElevationField();
        inputType.addEventListener('change', this._toggleElevationField.bind(this))
    }
    _getPosition() {
        if (navigator?.geolocation) {
            navigator?.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
                alert('Could not get your current position');
            });
        }
    }
    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        console.log(
            `https://www.google.com/maps/@${latitude},${longitude},17z`
        );
        this.#map = L.map('map').setView([latitude, longitude], 13);

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
    }

    _showForm(mapE) {
        form.classList.remove('hidden');
        this.#mapEvent = mapE;


    }
    _toggleElevationField(e) {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        e.preventDefault();

        const { lat, lng } = this.#mapEvent.latlng;
        // Trying out icon
        const LeafIcon = L.Icon.extend({
            options: {
                iconSize: [38, 45],

                iconAnchor: [20, 50],

                popupAnchor: [-3, -56],
            },
        });
        const mapIcon = new LeafIcon({ iconUrl: 'icon.png' });
        L.marker([lat, lng], { icon: mapIcon })
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                })
            )
            .setPopupContent(`${inputType.value}`)
            .openPopup();
        // form.classList.add('hidden');
        inputDistance.value =
            inputDuration.value =
            inputCadence.value =
            inputElevation.value =
            '';
    }
}

// creating object with class App
const app = new App();




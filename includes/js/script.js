const convertButton = document.getElementById("convertButton");
const downloadButton = document.getElementById("downloadButton");
const feedback = document.getElementById("feedback");

// Song Details
const songURL = document.getElementById("songURL");
const songImage = document.getElementById("songImage");
const songArtist = document.getElementById("songArtist");
const songTitle = document.getElementById("songTitle");

// Sections
const loadingSection = document.getElementById("loadingSection");
const downloadSection = document.getElementById("downloadSection");

// Event handling
convertButton.onclick = submitSong;

// Submit Song Function
function submitSong() {
	var pattern = /https:\/\/soundcloud.com\/.*\/.+/i;
	if (songURL.value == "" || songURL.value.match(pattern) == null) {
		feedback.innerHTML = "<div class='alert alert-danger alert-dismissible fade show' role='alert'><strong>Error!</strong> Please enter a valid url to a Soundcloud song.<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
	} else {
		loadingSection.style.display = "block";
		console.log(songURL.value);

		fetch("http://localhost:51507/convertSong", {
			method: "POST",
			body: {"song": songURL.value},
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				console.log(res);
				
				let data = JSON.parse(res);
				
				let musicBuffer = Buffer.from(
					Buffer.from(data["songBuffer"]["data"])
				);
					
				makeBlob(data["songName"], musicBuffer);

				songImage.src = data["songImage"];
				songArtist.innerHTML = data["songArtist"];
				songTitle.innerHTML = data["songTitle"];
					
				// Display result
				loadingSection.style.display = "none";
				downloadSection.style.display = "block";
			})
			.catch((err) => err);
	}
}

// Make blob function
function makeBlob(songName, byte) {
	var blob = new Blob([byte], { type: "audio/mp3" });
	downloadButton.href = window.URL.createObjectURL(blob);
	var fileName = songName;
	downloadButton.download = fileName;
}

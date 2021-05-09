const SoundCloud = require("soundcloud-scraper");
const request = require("request");
const NodeID3 = require("node-id3");

var soundcloudAccountId = process.env.SOUNDCLOUD_KEY;
const client = new SoundCloud.Client(soundcloudAccountId);

exports.handler = async function(event, context) {
	var data = JSON.parse(event.body);
	var result;
    
	const getSong = new Promise((resolve, reject) => {
		var resultBuffer;
		client
		.getSongInfo(data["song"])
		.then(async (song) => {
			let musicBuffer;
			let imageBuffer;

			//console.log(song);
			const stream = await song.downloadProgressive();

			let urlSong =
				"https://cf-media.sndcdn.com" +
				stream["socket"]["_httpMessage"]["connection"]["_httpMessage"][
					"path"
				];

			const getMusicBuffer = new Promise((resolve, reject) => {
				request(
					{ url: urlSong, encoding: null },
					(err, resp, buffer) => {
						resolve(buffer);
					}
				);
			});

			let urlImage = song.thumbnail;

			const getImageBuffer = new Promise((resolve, reject) => {
				request(
					{ url: urlImage, encoding: null },
					(err, resp, buffer) => {
						resolve(buffer);
						//console.log("Thumbnail Done");
					}
				);
			});

			musicBuffer = await getMusicBuffer;
			imageBuffer = await getImageBuffer;

			let tags = {
				title: song.title.replace("&amp;", "&"),
				artist: song.author.name.replace("&amp;", "&"),
				genre: song.genre,
				year: song.publishedAt.getFullYear(),
				image: {
					mime: "png/jpeg" / undefined,
					type: {
						id: 3,
						name: "front cover",
					}, // See https://en.wikipedia.org/wiki/ID3#ID3v2_embedded_image_extension
					description: "Cover Picture",
					imageBuffer: imageBuffer,
				},
			};

			const makeResultBuffer = new Promise((resolve, reject) => {
				NodeID3.write(tags, musicBuffer, function(err, buffer) {
					resolve(buffer);
				});
			});

			resultBuffer = await makeResultBuffer;

			resolve({songArtist: song.author.name.replace("&amp;", "&"), songTitle: song.title.replace("&amp;", "&"), songImage: song.thumbnail, songBuffer: resultBuffer});
			
		})
		.catch(function(reason) {
			console.log(reason);
		});
	});

	result = await getSong;

	return {
		statusCode: 200,
		body: JSON.stringify(result),
		headers: {
			"Access-Control-Allow-Origin": "*"
		}
	};
}
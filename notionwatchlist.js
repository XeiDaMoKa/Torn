// ==UserScript==
// @name               My Notion WatchList with Trakt API
// @version            1.0
// @description        Observe search fields for different services and display Trakt API results in a popup below the search element
// @author             XeiDaMoKa
// @match              https://trakt.tv/*
// @grant              GM_xmlhttpRequest
// @grant              GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

	const TRAKT_API_KEY = '8f0c32a2caa6da50bf0d0312cd858a5435b3f7f56b6d4dc15d2b9187de17a44c';
	const NOTION_API_KEY = 'secret_n6kYXH6ah8hEP8mDGtFs9arPGMKDyKeefxUccf2QzVA';
	const NOTION_DATABASE_ID = '15e2a9c404f7801b91a4d6a269ec63e1';
	const TMDB_API_KEY = '902af2ec7064ea9189ffaec74eb21621';




        console.log('Running Trakt script');

	const COUNTRY_CODE_MAPPING = {
		'KR': 'South Korea',
		'jp': 'Japan',
		'th': 'Thailand',
		'ph': 'Philippines',
	};


	function createButton() {
		const target = document.querySelector('h1');
		if (target && isValidPage()) {
			const button = document.createElement('button');
			button.id = 'notionSaveButton';
			button.textContent = 'Checking Notion';
			button.style.cssText = `
                margin-left: 10px;
                font-size: 18px;
                background-color: #330055;
                color: #ff5500;
                border-radius: 15px;
                border: 2px solid #ff5500;
                padding: 5px 10px;
                cursor: pointer;
            `;
			button.disabled = true;
			target.appendChild(button);
			const url = window.location.href;
			checkIfExistsInNotion(url, button);
		}
	}


	function isValidPage() {
		const url = window.location.href;
		return /^https:\/\/trakt\.tv\/(shows|movies)\/[^\/]+$/.test(url);
	}


	function checkIfExistsInNotion(pageUrl, button) {
		const notionApiUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
		const queryPayload = {
			filter: {
				property: 'URL',
				url: {
					equals: pageUrl}}
		};
		GM_xmlhttpRequest({
			method: 'POST',
			url: notionApiUrl,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${NOTION_API_KEY}`,
				'Notion-Version': '2022-06-28'
			},
			data: JSON.stringify(queryPayload),
			onload: function(response) {
				if (response.status >= 200 && response.status < 300) {
					const result = JSON.parse(response.responseText);
					if (result.results.length > 0) {
						button.textContent = 'Update in Notion';
						button.disabled = false;
						button.addEventListener('click', function() {
							button.textContent = 'Updating...';
							getTraktData(button, true); // Pass isUpdate = true
						});
					} else {
						button.textContent = 'Save in Notion';
						button.disabled = false;
						button.addEventListener('click', function() {
							button.textContent = 'Calling API';
							getTraktData(button);});}
				} else {
					console.error('Notion API query failed with status:', response.status);
					button.textContent = 'Error, Try Again';}},
			onerror: function() {
				console.error('Network error occurred while checking Notion');
				button.textContent = 'Error, Try Again';}});
	}


function getTraktData(button, isUpdate = false) {
    const url = window.location.href;
    const pathMatch = url.match(/^https:\/\/trakt\.tv\/(shows|movies)\/([^\/]+)$/);
    if (pathMatch) {
        const type = pathMatch[1];
        const slug = pathMatch[2];
        const showApiUrl = `https://api.trakt.tv/${type}/${encodeURIComponent(slug)}?extended=full`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: showApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'trakt-api-key': TRAKT_API_KEY,
                'trakt-api-version': '2'
            },
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const data = JSON.parse(response.responseText);
                        const tmdbId = data.ids.tmdb;

                        console.log('Trakt data "first_aired" raw value:', data.first_aired);
                        const dateObj = new Date(data.first_aired);
                        if (isNaN(dateObj.getTime())) {
                            console.error('Invalid "first_aired" date =>', data.first_aired);
                        }
                        const airedDate = dateObj.toISOString().split('T')[0];

                        getTmdbImages(tmdbId, 'show', null, null, function(showImages) {
                            const status = data.status;
                            const rawCountry = data.country || 'Unknown';
                            const mappedCountry = COUNTRY_CODE_MAPPING[rawCountry.toUpperCase()];
                            const countryName = mappedCountry ? mappedCountry : rawCountry;
                            const genres = (data.genres || []).map(genre => ({
                                name: genre.charAt(0).toUpperCase() + genre.slice(1)
                            }));
                            const network = {
                                name: data.network || 'Unknown'
                            };

                            // Add description
                            const description = data.overview || 'No description available';

                            const seasonsApiUrl = `https://api.trakt.tv/${type}/${encodeURIComponent(slug)}/seasons?extended=full`;

                            GM_xmlhttpRequest({
                                method: 'GET',
                                url: seasonsApiUrl,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'trakt-api-key': TRAKT_API_KEY,
                                    'trakt-api-version': '2'
                                },
                                onload: function(seasonsResponse) {
                                    if (seasonsResponse.status >= 200 && seasonsResponse.status < 300) {
                                        try {
                                            const seasons = JSON.parse(seasonsResponse.responseText);
                                            const episodeData = [];
                                            const promises = seasons.map(season => {
                                                return new Promise(resolve => {
                                                    const episodeApiUrl = `https://api.trakt.tv/${type}/${encodeURIComponent(slug)}/seasons/${season.number}/episodes?extended=full`;
                                                    GM_xmlhttpRequest({
                                                        method: 'GET',
                                                        url: episodeApiUrl,
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'trakt-api-key': TRAKT_API_KEY,
                                                            'trakt-api-version': '2'
                                                        },
                                                        onload: function(episodeResponse) {
                                                            if (episodeResponse.status >= 200 && episodeResponse.status < 300) {
                                                                const episodes = JSON.parse(episodeResponse.responseText);
                                                                episodeData.push({
                                                                    season: season.number === 0 ? 'Specials' : season.number,
                                                                    episodes: episodes.map(episode => ({
                                                                        ...episode,
                                                                        duration: episode.runtime // Add duration here
                                                                    }))
                                                                });
                                                                resolve();
                                                            } else {
                                                                console.error(`API call for Season ${season.number} episodes failed with status:`, episodeResponse.status);
                                                                resolve();
                                                            }
                                                        },
                                                        onerror: function() {
                                                            console.error(`Network error occurred while fetching Season ${season.number} episodes`);
                                                            resolve();
                                                        }
                                                    });
                                                });
                                            });

                                            Promise.all(promises).then(() => {
                                                const consolidatedData = {
                                                    title: data.title,
                                                    url: url,
                                                    airedDate: airedDate,
                                                    status: status.charAt(0).toUpperCase() + status.slice(1),
                                                    country: countryName,
                                                    genres: genres,
                                                    network: network,
                                                    images: showImages,
                                                    episodes: episodeData,
                                                    description: description, // Add description here
                                                    slug: slug // Add slug to consolidatedData
                                                };
                                                console.log('Trakt Data:', consolidatedData);
                                                button.textContent = 'Saving to Notion';
                                                saveAndCreatePages(consolidatedData, button, slug, isUpdate); // Pass slug to saveAndCreatePages
                                            });
                                        } catch (e) {
                                            console.error('Failed to parse seasons JSON:', e);
                                            button.textContent = 'Error, Try Again';
                                        }
                                    } else {
                                        console.error('API call for seasons failed with status:', seasonsResponse.status);
                                        button.textContent = 'Error, Try Again';
                                    }
                                },
                                onerror: function() {
                                    console.error('Network error occurred while fetching seasons');
                                    button.textContent = 'Error, Try Again';
                                }
                            });
                        });
                    } catch (e) {
                        console.error('Failed to parse show JSON:', e);
                        button.textContent = 'Error, Try Again';
                    }
                } else {
                    console.error('API call for show details failed with status:', response.status);
                    button.textContent = 'Error, Try Again';
                }
            },
            onerror: function() {
                console.error('Network error occurred while fetching show details');
                button.textContent = 'Error, Try Again';
            }
        });
    }
}




function getTmdbImages(tmdbId, type, seasonNumber, episodeNumber, callback) {
    let apiUrl;
    if (type === 'show') {
        apiUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}`;
    } else if (type === 'season') {
        apiUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
    } else if (type === 'episode') {
        apiUrl = `https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNumber}/episode/${episodeNumber}?api_key=${TMDB_API_KEY}`;
    } else {
        console.error('Invalid type specified for TMDb image fetch');
        callback({});
        return;
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
                try {
                    const data = JSON.parse(response.responseText);
                    let images = {};

                    if (type === 'show' || type === 'season') {
                        images.posterUrl = data.poster_path ? `https://image.tmdb.org/t/p/w300${data.poster_path}` : null;
                        images.backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null;
                    } else if (type === 'episode') {
                        images.stillUrl = data.still_path ? `https://image.tmdb.org/t/p/w300${data.still_path}` : null;
                    }

                    callback(images);
                } catch (e) {
                    console.error('Failed to parse TMDb response:', e);
                    callback({});
                }
            } else {
                console.error('TMDb API call failed with status:', response.status);
                callback({});
            }
        },
        onerror: function() {
            console.error('Network error occurred while fetching TMDb images');
            callback({});
        }
    });
}


function saveAndCreatePages(data, button, slug, isUpdate) { // Add slug parameter
    const notionApiUrl = 'https://api.notion.com/v1/pages';
    const { title, url, airedDate, status, country, genres, network, images, episodes, description } = data;

    // Calculate total show duration
    const totalShowDuration = episodes.reduce((sum, seasonData) => {
        const seasonDuration = seasonData.episodes.reduce((seasonSum, episode) => seasonSum + (episode.duration || 0), 0);
        return sum + seasonDuration;
    }, 0);
const showPayload = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
        Name: { title: [{ text: { content: title } }] },
        URL: { url },
        Aired: airedDate ? { date: { start: airedDate } } : null,
        State: { select: { name: status } },
        Country: { select: { name: country } },
        Genre: { multi_select: genres },
        Stream: { multi_select: [network] },
        Duration: { number: totalShowDuration },
        Description: { rich_text: [{ text: { content: description } }] },
        WatchList: { relation: [{ id: '15e2a9c404f780b1ae83c64a1b933620' }] }
    },
    icon: images.posterUrl ? { type: 'external', external: { url: images.posterUrl } } : undefined,
    cover: images.backdropUrl ? { type: 'external', external: { url: images.backdropUrl } } : undefined
};

if (!showPayload.properties.Aired) {
    delete showPayload.properties.Aired;
}

function createSeasonPages(showPageId, showTitle, episodes, slug, isUpdate, onComplete) { // Add slug parameter
    // Sort episodes within each season in ascending order
    episodes.forEach(seasonData => {
        seasonData.episodes.sort((a, b) => a.number - b.number);
    });

    // Sort seasons in natural order, keeping "Specials" at the end
    const sortedEpisodes = episodes.sort((a, b) => {
        if (a.season === 'Specials') return 1;
        if (b.season === 'Specials') return -1;
        const aSeason = parseInt(a.season, 10);
        const bSeason = parseInt(b.season, 10);
        return aSeason - bSeason;
    });

    let pendingRequests = sortedEpisodes.length;
    let hasError = false;

    if (pendingRequests === 0) {
        onComplete();
        return;
    }

    const showUrl = document.querySelector('a[href^="https://www.themoviedb.org/tv/"]');
    const tmdbId = showUrl ? showUrl.href.split('/').pop() : null;
    let defaultPosterUrl = '';
    let defaultBackdropUrl = '';

    const createOrUpdateSeason = (seasonData, images) => {
        const seasonNumber = seasonData.season === 'Specials' ? 0 : seasonData.season;
        const seasonName = seasonData.season === 'Specials' ? 'Specials' : `Season ${seasonNumber}`;
        const fullSeasonName = `${seasonName} - ${showTitle}`;
        const totalDuration = seasonData.episodes.reduce((sum, episode) => sum + (episode.duration || 0), 0); // Calculate total duration
        const seasonUrl = `https://trakt.tv/shows/${slug}/seasons/${seasonNumber}`; // Construct season URL

const seasonPayload = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
        Name: {
            title: [{ text: { content: fullSeasonName } }]
        },
        "Sup-item": { relation: [{ id: showPageId }] },
        Aired: seasonData.episodes[0].first_aired ? {
            date: { start: new Date(seasonData.episodes[0].first_aired).toISOString().split('T')[0] }
        } : null,
        Duration: { number: totalDuration },
        WatchList: { relation: [{ id: '15e2a9c404f780b1ae83c64a1b933620' }] },
        URL: { url: seasonUrl } // Add URL for the season
    },
    icon: images.posterUrl || defaultPosterUrl ? { type: 'external', external: { url: images.posterUrl || defaultPosterUrl } } : null,
    cover: images.backdropUrl || defaultBackdropUrl ? { type: 'external', external: { url: images.backdropUrl || defaultBackdropUrl } } : null
};

if (!seasonPayload.properties.Aired) {
    delete seasonPayload.properties.Aired;
}

        console.log('Creating season page with payload:', seasonPayload);

        upsertNotionPageByUrl(seasonUrl, seasonPayload, isUpdate, function(seasonPageId) {
            createEpisodePages(seasonPageId, seasonData.episodes, tmdbId, slug, isUpdate, () => {
                if (--pendingRequests === 0) {
                    if (!hasError) {
                        onComplete();
                    } else {
                        console.error('Some season pages or episodes failed to create. Season creation is complete with errors.');
                    }
                }
            });
        });
    };

    if (tmdbId) {
        getTmdbImages(tmdbId, 'show', null, null, (images) => {
            defaultPosterUrl = images.posterUrl;
            defaultBackdropUrl = images.backdropUrl;
            sortedEpisodes.forEach(seasonData => {
                getTmdbImages(tmdbId, 'season', seasonData.season === 'Specials' ? 0 : seasonData.season, null, (seasonImages) => {
                    createOrUpdateSeason(seasonData, seasonImages);
                });
            });
        });
    } else {
        sortedEpisodes.forEach(seasonData => {
            createOrUpdateSeason(seasonData, {});
        });
    }
}


function createEpisodePages(seasonPageId, episodes, tmdbId, slug, isUpdate, onComplete) { // Add slug parameter
    // Sort episodes in ascending order by episode number
    episodes.sort((a, b) => a.number - b.number);
    let pendingRequests = episodes.length;
    let hasError = false;

    if (pendingRequests === 0) {
        onComplete();
        return;
    }
    const queue = episodes.slice();

    function processNextEpisode() {
        if (queue.length === 0) {
            if (!hasError) {
                onComplete();
            } else {
                console.error('Some episode pages failed to create. Episode creation is complete with errors.');
            }
            return;
        }
        const episode = queue.shift();
        const formattedTitle = `${episode.season}x${episode.number} - ${episode.title}`;
        const duration = episode.runtime || 0; // Get duration in minutes
        const episodeUrl = `https://trakt.tv/shows/${slug}/seasons/${episode.season}/episodes/${episode.number}`; // Construct episode URL
        getTmdbImages(tmdbId, 'episode', episode.season, episode.number, (episodeImages) => {
            if (!episodeImages.stillUrl) {
                // If episode doesn't have an image, use season's image
                getTmdbImages(tmdbId, 'season', episode.season === 'Specials' ? 0 : episode.season, null, (seasonImages) => {
                    episodeImages.stillUrl = seasonImages.posterUrl;
                    saveEpisodePage(episodeImages);
                });
            } else {
                saveEpisodePage(episodeImages);
            }
        });

        function saveEpisodePage(images) {
const episodePayload = {
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
        Name: { title: [{ text: { content: formattedTitle } }] },
        "Sup-item": { relation: [{ id: seasonPageId }] },
        Aired: episode.first_aired ? { date: { start: episode.first_aired } } : null,
        Duration: { number: duration },
        WatchList: { relation: [{ id: '15e2a9c404f780b1ae83c64a1b933620' }] },
        URL: { url: episodeUrl } // Add URL for the episode
    },
    icon: images.stillUrl ? { type: 'external', external: { url: images.stillUrl } } : undefined,
    cover: images.stillUrl ? { type: 'external', external: { url: images.stillUrl } } : undefined
};

if (!episodePayload.properties.Aired) {
    delete episodePayload.properties.Aired;
}
            upsertNotionPageByUrl(episodeUrl, episodePayload, isUpdate, function(episodePageId) {
                const updatePayload = {
                    properties: {
                        "Related Itself": {
                            relation: [{ id: episodePageId }]
                        }
                    }
                };

                GM_xmlhttpRequest({
                    method: 'PATCH',
                    url: `${notionApiUrl}/${episodePageId}`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${NOTION_API_KEY}`,
                        'Notion-Version': '2022-06-28'
                    },
                    data: JSON.stringify(updatePayload),
                    onload: function(updateResponse) {
                        if (updateResponse.status >= 200 && updateResponse.status < 300) {
                            console.log(`Episode page updated with ID: ${episodePageId}, Added relation: "Related Itself"`);
                            processNextEpisode();
                        } else {
                            console.error('Failed to update episode page with "Related Itself" relation. Status:', updateResponse.status);
                            hasError = true;
                            processNextEpisode();
                        }
                    },
                    onerror: function() {
                        console.error('Network error occurred while updating episode page with "Related Itself" relation');
                        hasError = true;
                        processNextEpisode();
                    }
                });
            });
        }
    }
    processNextEpisode();
}
    upsertNotionPageByUrl(url, showPayload, isUpdate, function(showPageId) {
        createSeasonPages(showPageId, title, episodes, slug, isUpdate, function() {
            button.textContent = 'Saved in Notion';
            button.disabled = true;
            console.log('Season and episode pages creation completed.');
        });
    });
}

function upsertNotionPageByUrl(url, payload, isUpdate, callback) {
    if (!isUpdate) {
        // Create page
        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://api.notion.com/v1/pages',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28'
            },
            data: JSON.stringify(payload),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    const result = JSON.parse(response.responseText);
                    console.log(`Page created with ID: ${result.id}, Added properties: ${JSON.stringify(payload.properties)}`);
                    callback(result.id);
                } else {
                    console.error('Notion API call failed with status:', response.status);
                }
            },
            onerror: function() {
                console.error('Network error occurred while creating page in Notion');
            }
        });
    } else {
        // Query Notion DB for this URL; if found, PATCH; else POST
        const notionApiUrl = `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`;
        const queryPayload = {
            filter: {
                property: 'URL',
                url: {
                    equals: url
                }
            }
        };
        GM_xmlhttpRequest({
            method: 'POST',
            url: notionApiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28'
            },
            data: JSON.stringify(queryPayload),
            onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                    const result = JSON.parse(response.responseText);
                    if (result.results.length > 0) {
                        const pageId = result.results[0].id;
                        GM_xmlhttpRequest({
                            method: 'PATCH',
                            url: `https://api.notion.com/v1/pages/${pageId}`,
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${NOTION_API_KEY}`,
                                'Notion-Version': '2022-06-28'
                            },
                            data: JSON.stringify(payload),
                            onload: function(updateResponse) {
                                if (updateResponse.status >= 200 && updateResponse.status < 300) {
                                    console.log(`Page updated with ID: ${pageId}, Updated properties: ${JSON.stringify(payload.properties)}`);
                                    callback(pageId);
                                } else {
                                    console.error('Notion API call to update page failed with status:', updateResponse.status);
                                }
                            },
                            onerror: function() {
                                console.error('Network error occurred while updating page in Notion');
                            }
                        });
                    } else {
                        GM_xmlhttpRequest({
                            method: 'POST',
                            url: 'https://api.notion.com/v1/pages',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${NOTION_API_KEY}`,
                                'Notion-Version': '2022-06-28'
                            },
                            data: JSON.stringify(payload),
                            onload: function(createResponse) {
                                if (createResponse.status >= 200 && createResponse.status < 300) {
                                    const result = JSON.parse(createResponse.responseText);
                                    console.log(`Page created with ID: ${result.id}, Added properties: ${JSON.stringify(payload.properties)}`);
                                    callback(result.id);
                                } else {
                                    console.error('Notion API call to create page failed with status:', createResponse.status);
                                }
                            },
                            onerror: function() {
                                console.error('Network error occurred while creating page in Notion');
                            }
                        });
                    }
                } else {
                    console.error('Notion API query failed with status:', response.status);
                }
            },
            onerror: function() {
                console.error('Network error occurred while querying Notion');
            }
        });
    }
}

createButton();
})();
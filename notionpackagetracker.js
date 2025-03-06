// ==UserScript==
// @name         Notion Parcel Tracker
// @version      1.17
// @description  Log Notion and Parcel responses in groups
// @author       XeiDaMoKa
// @match        https://www.notion.so/xeidamoka/PacKaGe-TRacKeR-PaGe-1182a9c404f7807aac7acb5b4f10ad37
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    const notionSecret = 'secret_Ee2iW1BdjecWgIsVsKpPcRI3QjDMHP67dwKIywXsbQF';
    const notionDatabaseId = '1182a9c404f7800a85edefb28cec6372';
    const parcelsApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MGUxZjFiMC04OWI5LTExZWYtYjhiMy0zNWUzNmRlZTdjNTkiLCJzdWJJZCI6IjY3MGM1NTIzYTYxN2Q1NjU3ZTY2YmY3NyIsImlhdCI6MTcyODg2MTQ3NX0.2dUnQy7-Wnky8TACLsrnvYPtmNlamUGT7sCdRHpIFg0';

    const $$ = console.log;
    const $$$ = console.error;
    const $$$$ = console.groupCollapsed;
    const $$$$$ = console.groupEnd;

    const parentItems = [];
    const subItemsMap = new Map();

    // Mapping for carrier names
    const carrierMapping = {
        'Portugal Post - Portugal CTT': 'Portugal CTT',
        'SunYou - Sytrack': 'SunYou',
        'PostNL - Netherlands Post': 'PostNL'
    };

    // Hardcoded origin mappings
    const originMapping = {
        'San Fernando de Henares': 'Spain'
    };

    function getNotionData(cursor = null) {
        const body = cursor ? { start_cursor: cursor } : {};

        GM_xmlhttpRequest({
            method: 'POST',
            url: `https://api.notion.com/v1/databases/${notionDatabaseId}/query`,
            data: JSON.stringify(body),
            headers: {
                'Authorization': `Bearer ${notionSecret}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            onload: function(response) {
                if (response.status === 200) {
                    const data = JSON.parse(response.responseText);

                    $$$$('Notion Data');
                    $$(`Raw Notion Response:`, data);
                    $$$$$(); // Close Notion Data Group

                    data.results.forEach(page => {
                        const pageId = page.id;
                        const properties = page.properties;
                        const notionOrigin = properties.Origin?.select?.name; // Get Origin from Notion
                        const notionCarriers = properties.Carriers?.multi_select?.map(tag => tag.name) || []; // Get Carriers from Notion
                        if (properties['Parent item']?.relation?.length === 0) {
                            parentItems.push({ pageId, properties, notionOrigin, notionCarriers });
                        } else {
                            const parentId = properties['Parent item']?.relation?.[0]?.id;
                            if (parentId) {
                                if (!subItemsMap.has(parentId)) {
                                    subItemsMap.set(parentId, []);
                                }
                                subItemsMap.get(parentId).push({ pageId, properties });
                            }
                        }
                    });

                    if (data.has_more) {
                        const nextCursor = data.next_cursor;
                        getNotionData(nextCursor);
                    } else {
                        $$$$('Tracking Requests');
                        parentItems.forEach(parent => {
                            const { properties, notionOrigin } = parent;
                            const trackingId = properties['Tracking ID']?.rich_text?.[0]?.plain_text;
                            const destination = properties.Destination?.select?.name;
                            const name = properties.Name?.title?.[0]?.plain_text || 'Untitled';
                            const status = properties.Status?.status?.name;

                            $$$$(name);
                            if (!trackingId || !destination) {
                                $$(`Missing tracking ID or destination`);
                                $$$$$();
                                return;
                            }

                            $$(`Tracking Request: ${trackingId} to ${destination} (Status: ${status})`);
                            $$$$$();
                        });
                        $$$$$(); // Close Tracking Requests Group

                        getParcelData();
                    }
                } else {
                    $$$('Failed to fetch Notion pages:', response.status, response.statusText);
                }
            },
            onerror: function(error) {
                $$$('Error with the API request:', error);
            }
        });
    }

    function getParcelData() {
        $$$$('Parcels Data');
        let pendingRequests = parentItems.length;

        parentItems.forEach(parent => {
            const { properties, notionOrigin, notionCarriers } = parent;
            const trackingId = properties['Tracking ID']?.rich_text?.[0]?.plain_text;
            const destination = properties.Destination?.select?.name;
            const name = properties.Name?.title?.[0]?.plain_text || 'Untitled';
            const status = properties.Status?.status?.name;

            if (!trackingId || !destination) {
                $$$(`Missing tracking ID or destination for ${name}`);
                pendingRequests--;
                if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
                return;
            }

            if (status === 'Delivered') {
                pendingRequests--;
                if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
                return;
            }

            const url = 'https://parcelsapp.com/api/v3/shipments/tracking';
            const data = JSON.stringify({
                shipments: [{ trackingId: trackingId, destinationCountry: destination }],
                language: 'en',
                apiKey: parcelsApiKey
            });

            GM_xmlhttpRequest({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data,
                onload: function(response) {
                    try {
                        $$$$(name); // Start a new group for each parentItem
                        if (response.status === 200) {
                            const responseData = JSON.parse(response.responseText);
                            const shipment = responseData.shipments[0];

                            if (!shipment) {
                                console.warn(`No shipment data found for tracking ID: ${trackingId}`);
                                $$$$$(); // Close the group for this parentItem
                                pendingRequests--;
                                if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
                                return;
                            }

                            const parcelOrigin = shipment.attributes?.find(attr => attr.l === 'origin')?.val ||
                                                 shipment.attributes?.find(attr => attr.l === 'from')?.val;

                            // Use 'unknown' if both attributes are missing
                            const updatedOrigin = originMapping[parcelOrigin] || parcelOrigin || 'unknown';

                            // Fetch carriers from Parcel API response
                            const parcelCarriers = shipment.carriers.map(carrier => carrierMapping[carrier] || carrier) || [];
                            const newCarriers = parcelCarriers.filter(carrier => !notionCarriers.includes(carrier));

                            // Fetch shipment states from Parcel API response
                            const parcelStates = shipment.states || [];
                            const notionSubItems = subItemsMap.get(parent.pageId) || [];
                            const notionStateNames = notionSubItems.map(item => item.properties.Name.title[0].plain_text);

                            const newStates = parcelStates.filter(state => !notionStateNames.includes(state.status));
                            const parcelStatus = shipment.status;
                            const capitalizedParcelStatus = parcelStatus.charAt(0).toUpperCase() + parcelStatus.slice(1).toLowerCase();

                            const lastShipmentDate = parcelStates.length > 0 ? parcelStates[0].date : null; // Get the first date

                            // Update package data
                            updateNotionPageData(
                                parent.pageId,
                                updatedOrigin,
                                capitalizedParcelStatus,
                                lastShipmentDate,
                                newCarriers,
                                properties['End Date']?.date?.start,
                                notionCarriers,
                                notionOrigin,                 // Pass existing origin
                                status                       // Pass existing status
                            );

                            if (newStates.length > 0) {
                                newStates.forEach(state => {
                                    addNotionSubItem(parent.pageId, state);
                                });
                            }

                            $$(`${name}:`, responseData);
                        } else {
                            $$$('Failed to fetch parcel data:', response.status, response.statusText);
                        }
                    } catch (error) {
                        $$$('Error processing parcel data for', name, ':', error);
                    }
                    $$$$$(); // Close the group for this parentItem
                    pendingRequests--;
                    if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
                },
                onerror: function(error) {
                    $$$('Error with the Parcels API request for', name, ':', error);
                    $$$$$(); // Close the group for this parentItem
                    pendingRequests--;
                    if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
                }
            });
        });

        if (pendingRequests === 0) $$$$$(); // Close Parcels Data Group
    }

    // Accept oldOrigin & oldStatus
    function updateNotionPageData(
        pageId,
        newOrigin,
        newStatus,
        endDate,
        newCarriers,
        currentEndDate,
        existingCarriers = [],
        oldOrigin = '',
        oldStatus = ''
    ) {
        const capitalizedStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1).toLowerCase();
        const updateUrl = `https://api.notion.com/v1/pages/${pageId}`;
        const updateData = {
            properties: {
                Origin: {
                    select: { name: newOrigin }
                },
                Status: {
                    status: { name: capitalizedStatus }
                },
                Carriers: {
                    multi_select: newCarriers.map(carrier => ({ name: carrier }))
                }
            }
        };

        // Combine existing carriers with new carriers
        const combinedCarriers = Array.from(new Set([...existingCarriers, ...newCarriers]));
        updateData.properties.Carriers = {
            multi_select: combinedCarriers.map(name => ({ name }))
        };

        // If the status is 'Delivered', use the provided end date (shipment date)
        // Otherwise, set the end date to today if it is different from the current end date
        const today = new Date().toISOString().split('T')[0];
        if (newStatus.toLowerCase() === 'delivered') {
            if (endDate) {
                updateData.properties['End Date'] = {
                    date: {
                        start: endDate.split('T')[0] // Extract only the date part
                    }
                };
            }
        } else if (currentEndDate !== today) {
            updateData.properties['End Date'] = {
                date: {
                    start: today
                }
            };
        }

        const desiredEndDate = newStatus.toLowerCase() === 'delivered'
            ? endDate?.split('T')[0]
            : (currentEndDate !== today ? today : currentEndDate);

        // Skip update if nothing changed
        const sameOrigin = newOrigin === oldOrigin;
        const sameStatus = capitalizedStatus === oldStatus;
        const sameCarriers = combinedCarriers.length === existingCarriers.length &&
            combinedCarriers.every(c => existingCarriers.includes(c));
        const sameEndDate = desiredEndDate === currentEndDate;

        if (sameOrigin && sameStatus && sameCarriers && sameEndDate) {
            $$(`No changes for page: ${pageId}. Skipping update.`);
            return;
        }

        GM_xmlhttpRequest({
            method: 'PATCH',
            url: updateUrl,
            data: JSON.stringify(updateData),
            headers: {
                'Authorization': `Bearer ${notionSecret}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            onload: function(response) {
                if (response.status === 200) {
                    $$(`Successfully updated data for page: ${pageId}`);
                } else {
                    // If status update fails due to invalid status option, update only the end date if needed
                    if (response.status === 400 && response.responseText.includes('Invalid status option')) {
                        console.warn(`Invalid status option for page: ${pageId}. Updating only the end date.`);
                        updateOnlyEndDateIfNeeded(pageId, currentEndDate);
                    } else {
                        $$$(`Failed to update data for page: ${pageId}`, response.status, response.statusText, response.responseText);
                    }
                }
            },
            onerror: function(error) {
                $$$('Error with the Notion API request:', error);
            }
        });
    }

    function updateOnlyEndDateIfNeeded(pageId, currentEndDate) {
        const today = new Date().toISOString().split('T')[0];
        if (currentEndDate !== today) {
            updateOnlyEndDate(pageId, today);
        }
    }

    function updateOnlyEndDate(pageId, endDate) {
        const updateUrl = `https://api.notion.com/v1/pages/${pageId}`;
        const updateData = {
            properties: {
                'End Date': {
                    date: {
                        start: endDate
                    }
                }
            }
        };

        GM_xmlhttpRequest({
            method: 'PATCH',
            url: updateUrl,
            data: JSON.stringify(updateData),
            headers: {
                'Authorization': `Bearer ${notionSecret}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            onload: function(response) {
                if (response.status === 200) {
                    $$(`Successfully updated End Date for page: ${pageId}`);
                } else {
                    $$$(`Failed to update End Date for page: ${pageId}`, response.status, response.statusText, response.responseText);
                }
            },
            onerror: function(error) {
                $$$('Error with the Notion API request:', error);
            }
        });
    }

    function addNotionSubItem(parentPageId, state) {
        const updateUrl = `https://api.notion.com/v1/pages`;
        const formattedDate = new Date(state.date).toISOString(); // Ensure date is in ISO format

        const updateData = {
            parent: { type: 'database_id', database_id: notionDatabaseId }, // Make sure to use your actual database ID
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: state.status
                            }
                        }
                    ]
                },
                Date: {
                    date: {
                        start: formattedDate
                    }
                },
                'Parent item': {
                    relation: [
                        {
                            id: parentPageId
                        }
                    ]
                }
            }
        };

        console.log('Adding sub-item with data:', updateData);

        GM_xmlhttpRequest({
            method: 'POST',
            url: updateUrl,
            data: JSON.stringify(updateData),
            headers: {
                'Authorization': `Bearer ${notionSecret}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            onload: function(response) {
                if (response.status === 200) {
                    const responseData = JSON.parse(response.responseText);
                    console.log(`Successfully added sub-item for state: ${state.status}`, responseData.id);
                } else {
                    console.error(`Failed to add sub-item for state: ${state.status}`, response.status, response.statusText, response.responseText);
                }
            },
            onerror: function(error) {
                console.error('Error with the Notion API request:', error);
            }
        });
    }

    getNotionData();
})();
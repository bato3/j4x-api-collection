
import JSON5 from 'json5'
import fetch from 'node-fetch'



/*
const collectionUrl = "https://raw.githubusercontent.com/alexandreelise/j4x-api-collection/master/j4x-api-complete-collection.postman_collection.json";
/*/
const collectionUrl = "https://raw.githubusercontent.com/alexandreelise/j4x-api-collection/2419ed1fd45883eae5ae8bb5caeabcb46d7d683b/j4x-api-complete-collection.postman_collection.json";
//*/
const targetFile = "j4x-api-complete-collection.postman_collection.json";



(async () => {
    const collection = await fetch(collectionUrl)
                            .then(resp => resp.text())
                            .then(text => JSON5.parse(text));

    /// rewrite variables
    let variables = {
        "base_url": {
            key:    "base_url",
            value:  "https://example.com"
        },
        "base_path": {
            key:    "base_path",
            value:  "api/index.php/v1/"
        },
        "auth_apikey": {
            key: "auth_apikey",
            value: "Paste your Joomla API Token here."
        }
    }
    /// process API endpoints
    collection.item.forEach((item, i) => {
        /// Remove basepath from name
        const url = item.request.url.raw
                .replace('{{base_path}}/api/index.php/v1/','')
                .replace(/[\{]+/g,'{').replace(/[\}]+/g,'}')
        collection.item[i].name = url

        /// normalize JSON body
        if(item.request.body && item.request.body.raw) {
            collection.item[i].request.body.raw = JSON.stringify(
                    JSON5.parse(item.request.body.raw))
        }

        /// normalize url
        const urlParts = url.replace(/[\{]+/g,'{{').replace(/[\}]+/g,'}}').split('/')

        collection.item[i].request.url = {
            raw:`{{base_url}}/{{base_path}}/${urlParts.join('/')}`,
            host: ['{{base_url}}'],
            path: ['{{base_path}}', ...urlParts]
        }
        /// discover variables
        const urlVariables = url.match(/\{([^\{\}]+)\}/g)
        if(urlVariables) {
            urlVariables.forEach(one => {
                one = one.replace(/[\{\}]+/g,'');
                variables[one] = {
                    key: one,
                    value: one == 'app'? '{site|administrator}':`{${one}}`
                }
            })
        }


    });
    console.log(collection.item[23].name
        , collection.item[23].request, collection.item[25].request
        );
})()

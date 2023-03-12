const { request, gql } = require('graphql-request');

const endpoint = 'https://api.receptagemini.pl/graphql/';

const query = gql`
    query getMedicineStockQuery($items: [ItemInput]) {
        searchInPharmacy(items: $items) {
            stockByPharmacy: StockByPharmacy {
                stock {
                    itemStatus
                }
                pharmacy {
                    street
                    buildingNumber
                    city
                    geoLocation {
                        latitude
                        longitude
                    }
                }
            }
        }
    }
`;

const getInfo = async (pharmId, amount) => {
    const variables = {
        items: [
            {
                ean: pharmId,
                qty: amount
            }
        ]
    }
    const data = await request(endpoint, query, variables)

    return data.searchInPharmacy.stockByPharmacy.filter(({ stock: [{ itemStatus }], pharmacy: { city } }) => itemStatus === 'AVAILABLE' && city === 'Kraków')
}

module.exports = {
    getInfo
};
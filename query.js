const { request, gql } = require('graphql-request');

const endpoint = 'https://api.receptagemini.pl/graphql/';

const query = gql`
  query getMedicineStockQuery($items: [ItemInput]) {
    searchInPharmacy(items: $items) {
      stockByPharmacy {
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

const getInfo = async (drugId, amount) => {
  const variables = {
    items: [
      {
        ean: drugId,
        qty: amount
      }
    ]
  };

  try {
    const data = await request(endpoint, query, variables);
    return data.searchInPharmacy.stockByPharmacy.filter(({ stock: [{ itemStatus }], pharmacy: { city } }) => itemStatus === 'AVAILABLE' && city === 'Kraków');
  } catch (error) {
    console.error(`Failed to fetch data for drug ${drugId} with error: ${error.message}`);
    return [];
  }
};

module.exports = {
  getInfo
};

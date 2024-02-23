import { FiatToken } from 'services/web3Provider/Token';

const ETHER_FIATS = [
  new FiatToken(
    'United States Dollar on Narfex',
    'USD',
    '0x26F80c0107070a8522ecdfae3a201719B1AFd4f8',
    1,
    6,
    'https://static.narfex.com/img/currencies/dollar.svg'
  ),
  new FiatToken(
    'Euro on Narfex',
    'EUR',
    '0x3095c04ca3C9c78CD0F9Ea2a3Fa0511998585Df9',
    1,
    6,
    'https://static.narfex.com/img/currencies/euro.svg'
  ),
  new FiatToken(
    'Russian Ruble on Narfex',
    'RUB',
    '0x5E11E947e69e8e6267e28C3db9425acd3AA4B489',
    1,
    6,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
  new FiatToken(
    'Indonesian Rupiah on Narfex',
    'IDR',
    '0x5624e3A00DdfC29765b4e164cD0dC38bFf0FC3a6',
    1,
    6,
    'https://static.narfex.com/img/currencies/indonesian-rupiah.svg'
  ),
  new FiatToken(
    'Ukrainian Hryvnia on Narfex',
    'UAH',
    '0x4f272815fb641082b0291025016aebEBBC6Cf0D7',
    1,
    6,
    'https://static.narfex.com/img/currencies/uah-gryvnya.svg'
  ),
  new FiatToken(
    'Chinese Yuan on Narfex',
    'CNY',
    '0x0E6e3EbE8a1b34E30CE903fd82105FacdFB7965E',
    1,
    6,
    'https://static.narfex.com/img/currencies/yuan-cny.svg'
  ),
  new FiatToken(
    'Polish Zloty on Narfex',
    'PLN',
    '0x52a7bdBE5E7F285f34D2598cc5629Bc3279870Cb',
    1,
    6,
    'https://static.narfex.com/img/currencies/pln.svg'
  ),
  new FiatToken(
    'Thai Baht on Narfex',
    'THB',
    '0x109F210b62ee8fF19Fd847936338Bc51d22dc7E7',
    1,
    6,
    'https://static.narfex.com/img/currencies/thb.svg'
  ),
  new FiatToken(
    'Vietnamese Dong on Narfex',
    'VND',
    '0xE2f2D206fDB9FC6ddfbaEcA7D916493c5d76987F',
    1,
    6,
    'https://static.narfex.com/img/currencies/vnd.svg'
  ),
  new FiatToken(
    'Turkish Lire on Narfex',
    'TRY',
    '0x5542E28DccF582192c36C41C1c9Aad4e9Dd85e20',
    1,
    6,
    'https://static.narfex.com/img/currencies/try.svg'
  ),
  new FiatToken(
    'British Pound on Narfex',
    'GBP',
    '0xf90250932472961DC80a0a0654A074D3e37188bB',
    1,
    6,
    'https://static.narfex.com/img/currencies/gbp-pound.svg'
  ),
  new FiatToken(
    'Canadian Dollar on Narfex',
    'CAD',
    '0x7099f572f039E44ACc2D8E4e024FB5507bCFE252',
    1,
    6,
    'https://static.narfex.com/img/currencies/cad.svg'
  ),
];

const POLYGON_FIATS = [
  new FiatToken(
    'United States Dollar on Narfex',
    'USD',
    '0x95f8a92D0c8C4Dff8e567ADb6c68758b7fc99287',
    137,
    6,
    'https://static.narfex.com/img/currencies/dollar.svg'
  ),
  new FiatToken(
    'Euro on Narfex',
    'EUR',
    '0x8f53BFc73b2FB7c6b0C26e8617b1d43a5af21b29',
    137,
    6,
    'https://static.narfex.com/img/currencies/euro.svg'
  ),
  new FiatToken(
    'Russian Ruble on Narfex',
    'RUB',
    '0xA4b698FF2DA1fFc2eE02c2A2433E2AFF396c9e6d',
    137,
    6,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
  new FiatToken(
    'Ukrainian Hryvnia on Narfex',
    'UAH',
    '0x533Ec6d91786Ed2600700dF67cd7B5BdBE1768A7',
    137,
    6,
    'https://static.narfex.com/img/currencies/uah-gryvnya.svg'
  ),
  new FiatToken(
    'Chinese Yuan on Narfex',
    'CNY',
    '0x88dF6195fA1B5d86403946004Aec9962476b5BA3',
    137,
    6,
    'https://static.narfex.com/img/currencies/yuan-cny.svg'
  ),
  new FiatToken(
    'Indonesian Rupiah on Narfex',
    'IDR',
    '0x7684A91B68B63CC0E077bcBb78919ab05485c2E1',
    137,
    6,
    'https://static.narfex.com/img/currencies/indonesian-rupiah.svg'
  ),
  new FiatToken(
    'Polish Zloty on Narfex',
    'PLN',
    '0xFa2d9846cb12a8e03e0F24498c5BAD6FA41EA1c7',
    137,
    6,
    'https://static.narfex.com/img/currencies/pln.svg'
  ),
  new FiatToken(
    'Thai Baht on Narfex',
    'THB',
    '0x59550031b68e67a141404caf241C61D0c8580565',
    137,
    6,
    'https://static.narfex.com/img/currencies/thb.svg'
  ),
  new FiatToken(
    'Vietnamese Dong on Narfex',
    'VND',
    '0x6a31E64B08CF35FfeAfbC707840a8E989307d9A0',
    137,
    6,
    'https://static.narfex.com/img/currencies/vnd.svg'
  ),
  new FiatToken(
    'Canadian Dollar on Narfex',
    'CAD',
    '0x98cA4f60F1AFdec251f059264d039632751368ef',
    137,
    6,
    'https://static.narfex.com/img/currencies/cad.svg'
  ),
  new FiatToken(
    'Turkish Lire on Narfex',
    'TRY',
    '0x8Eb2638444037394b5440192422337F4Cc211810',
    137,
    6,
    'https://static.narfex.com/img/currencies/try.svg'
  ),
  new FiatToken(
    'British Pound on Narfex',
    'GBP',
    '0xEDd5854E28b52DBbB312CbfA191b545E32C4F0cF',
    137,
    6,
    'https://static.narfex.com/img/currencies/gbp-pound.svg'
  ),
];

const ARBITRUM_FIATS = [
  new FiatToken(
    'United States Dollar on Narfex',
    'USD',
    '0x7dd8dDFcc4E10efcfF9553c109FDd35071a1e87a',
    42161,
    6,
    'https://static.narfex.com/img/currencies/dollar.svg'
  ),
  new FiatToken(
    'Euro on Narfex',
    'EUR',
    '0xFf3492ee2c335bEdbc3A77aE4FcDB75272A1a03f',
    42161,
    6,
    'https://static.narfex.com/img/currencies/euro.svg'
  ),
  new FiatToken(
    'Russian Ruble on Narfex',
    'RUB',
    '0xf9A45bbcf419A0660dac64517fe9625203415CFE',
    42161,
    6,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
  new FiatToken(
    'Ukrainian Hryvnia on Narfex',
    'UAH',
    '0x7C6b157DE0f62f980CbBA8c8Cf862Acf5d9882a3',
    42161,
    6,
    'https://static.narfex.com/img/currencies/uah-gryvnya.svg'
  ),
  new FiatToken(
    'Chinese Yuan on Narfex',
    'CNY',
    '0xAfe7bb0A7F5386b4736B5A07C7c282A8F6feA8e9',
    42161,
    6,
    'https://static.narfex.com/img/currencies/yuan-cny.svg'
  ),
  new FiatToken(
    'Indonesian Rupiah on Narfex',
    'IDR',
    '0xA9b81E1d69C2B8FE50b04e7363c51C5Ef0e1495a',
    42161,
    6,
    'https://static.narfex.com/img/currencies/indonesian-rupiah.svg'
  ),
  new FiatToken(
    'Polish Zloty on Narfex',
    'PLN',
    '0x819067F88A63E7F52b868Ad5054ce744AD3f90BF',
    42161,
    6,
    'https://static.narfex.com/img/currencies/pln.svg'
  ),
  new FiatToken(
    'Thai Baht on Narfex',
    'THB',
    '0xa1b26D1E4D118dcc9907A0e03dEc8599A904cD1B',
    42161,
    6,
    'https://static.narfex.com/img/currencies/thb.svg'
  ),
  new FiatToken(
    'Vietnamese Dong on Narfex',
    'VND',
    '0xb688a277F6E094d808F2a97f14a3497F65bD901B',
    42161,
    6,
    'https://static.narfex.com/img/currencies/vnd.svg'
  ),
  new FiatToken(
    'Canadian Dollar on Narfex',
    'CAD',
    '0xeD9e2129E59824604C0051920901cAE46d5653B3',
    42161,
    6,
    'https://static.narfex.com/img/currencies/cad.svg'
  ),
  new FiatToken(
    'Turkish Lire on Narfex',
    'TRY',
    '0x01e30335a994303e6855748a132CFA825ed6F4f7',
    42161,
    6,
    'https://static.narfex.com/img/currencies/try.svg'
  ),
  new FiatToken(
    'British Pound on Narfex',
    'GBP',
    '0xD028348D68F31Cc6d0311F620B0198C69D5bef5A',
    42161,
    6,
    'https://static.narfex.com/img/currencies/gbp-pound.svg'
  ),
];

const TESTNET_FIATS = [
  new FiatToken(
    'Testnet United States Dollar',
    'USD',
    '0x6dBB65750a6BBE8A0CBD28257008C464bAbe4de6',
    97,
    18,
    'https://static.narfex.com/img/currencies/dollar.svg'
  ),
  new FiatToken(
    'Testnet Russian Ruble',
    'RUB',
    '0x93e9fefdb37431882D1A27bB794E73a191ebD945',
    97,
    18,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
  new FiatToken(
    'Testnet Ukrainian Hryvnia',
    'UAH',
    '0xbD6a27FF04405F0111D8d811951b53B7cbb1bf95',
    97,
    18,
    'https://static.narfex.com/img/currencies/uah-gryvnya.svg'
  ),
  new FiatToken(
    'Testnet Chinese Yuan on Narfex',
    'CNY',
    '0x6CbcfF2b0bCd4a23b016C3dc419E73620058c802',
    97,
    18,
    'https://static.narfex.com/img/currencies/yuan-cny.svg'
  ),
  new FiatToken(
    'Testnet Indonesian Rupiah on Narfex',
    'IDR',
    '0x91049b125A7c57971B52d96c6eB931AC500EC98D',
    97,
    18,
    'https://static.narfex.com/img/currencies/indonesian-rupiah.svg'
  ),
];

const MUMBAI_FIATS = [
  new FiatToken(
    'Testnet Russian Ruble',
    'RUB',
    '0x4107a32e44c69a2244c260413ee9ed67F5c57969',
    80001,
    6,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
];

const SONGBIRD_FIATS = [

];

const KNOWN_FIATS = [
  new FiatToken(
    'United States Dollar on Narfex',
    'USD',
    '0xc0Bd103de432a939F93E1E2f8Bf1e5C795774F90',
    56,
    18,
    'https://static.narfex.com/img/currencies/dollar.svg'
  ),
  new FiatToken(
    'Euro on Narfex',
    'EUR',
    '0xa702e05965FEd09FDDFE4ca182b0915CdBa367c8',
    56,
    18,
    'https://static.narfex.com/img/currencies/euro.svg'
  ),
  new FiatToken(
    'Russian Ruble on Narfex',
    'RUB',
    '0xC7b9dA3D064a918B8e04B23AEEdBD64CBa21D37d',
    56,
    18,
    'https://static.narfex.com/img/currencies/rubles.svg'
  ),
  new FiatToken(
    'Ukrainian Hryvnia on Narfex',
    'UAH',
    '0xcAA5eb94f5339a598580A68f88F1471c36599dDA',
    56,
    18,
    'https://static.narfex.com/img/currencies/uah-gryvnya.svg'
  ),
  new FiatToken(
    'Chinese Yuan on Narfex',
    'CNY',
    '0xA61Feb03EB111373a84A4b303Ea391140fa3291c',
    56,
    18,
    'https://static.narfex.com/img/currencies/yuan-cny.svg'
  ),
  new FiatToken(
    'Indonesian Rupiah on Narfex',
    'IDR',
    '0x814b62d5a157498145c59820763430Ce7558bA6e',
    56,
    18,
    'https://static.narfex.com/img/currencies/indonesian-rupiah.svg'
  ),
  new FiatToken(
    'Polish Zloty on Narfex',
    'PLN',
    '0x815fe8056d867052bde314018166f144c11f6c4c',
    56,
    18,
    'https://static.narfex.com/img/currencies/pln.svg'
  ),
  new FiatToken(
    'Thai Baht on Narfex',
    'THB',
    '0xf21311db1d6ae2538dc86a0bbc751c53439e0895',
    56,
    18,
    'https://static.narfex.com/img/currencies/thb.svg'
  ),
  new FiatToken(
    'Vietnamese Dong on Narfex',
    'VND',
    '0x9a630ef70abf193bb24b082d7a10c515c0e847c6',
    56,
    18,
    'https://static.narfex.com/img/currencies/vnd.svg'
  ),
  new FiatToken(
    'Canadian Dollar on Narfex',
    'CAD',
    '0x1ade4f9b177a42b160cb304ce402f1daabfb2d2d',
    56,
    18,
    'https://static.narfex.com/img/currencies/cad.svg'
  ),
  new FiatToken(
    'Turkish Lire on Narfex',
    'TRY',
    '0x8845161A0EA235F9e94c815241A0e63AcbaC144B',
    56,
    18,
    'https://static.narfex.com/img/currencies/try.svg'
  ),
  new FiatToken(
    'British Pound on Narfex',
    'GBP',
    '0xC00565016486b345BefdD38c6BEA3A4E497F7633',
    56,
    18,
    'https://static.narfex.com/img/currencies/gbp-pound.svg'
  ),
  ...TESTNET_FIATS,
  ...ETHER_FIATS,
  ...POLYGON_FIATS,
  ...ARBITRUM_FIATS,
  ...MUMBAI_FIATS,
  ...SONGBIRD_FIATS,
];

export default KNOWN_FIATS;

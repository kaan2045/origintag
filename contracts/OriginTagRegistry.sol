// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title OriginTag Kayit Defteri
/// @notice Cografi isaretli urunlerin SHA-256 hash kayitlarini degistirilemez
///         bicimde Polygon blockchain'inde tutar.
contract OriginTagRegistry {

    struct Kayit {
        string urunAdi;
        string urunTipi;
        uint256 zamanDamgasi;
        address kaydedenAdres;
        bool mevcut;
    }

    // hash => Kayit
    mapping(string => Kayit) private kayitlar;

    // Sadece kontrat sahibi (OriginTag backend cuzdani) yeni kayit ekleyebilir
    address public owner;

    event KayitEklendi(
        string hash,
        string urunAdi,
        string urunTipi,
        uint256 zamanDamgasi,
        address kaydedenAdres
    );

    modifier sadeceOwner() {
        require(msg.sender == owner, "Sadece yetkili adres kayit ekleyebilir");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Yeni bir urun kaydi ekler. Ayni hash ile sadece bir kez kayit yapilabilir.
    function kayitEkle(
        string memory hash,
        string memory urunAdi,
        string memory urunTipi
    ) public sadeceOwner {
        require(!kayitlar[hash].mevcut, "Bu hash icin kayit zaten mevcut");

        kayitlar[hash] = Kayit({
            urunAdi: urunAdi,
            urunTipi: urunTipi,
            zamanDamgasi: block.timestamp,
            kaydedenAdres: msg.sender,
            mevcut: true
        });

        emit KayitEklendi(hash, urunAdi, urunTipi, block.timestamp, msg.sender);
    }

    /// @notice Verilen hash'e ait kaydi getirir. Herkes tarafindan cagrilabilir (ucretsiz, gas gerektirmez).
    function kayitGetir(string memory hash)
        public
        view
        returns (
            string memory urunAdi,
            string memory urunTipi,
            uint256 zamanDamgasi,
            address kaydedenAdres,
            bool mevcut
        )
    {
        Kayit memory k = kayitlar[hash];
        return (k.urunAdi, k.urunTipi, k.zamanDamgasi, k.kaydedenAdres, k.mevcut);
    }

    /// @notice Bir hash'in kayitli olup olmadigini hizlica kontrol eder.
    function kayitVarMi(string memory hash) public view returns (bool) {
        return kayitlar[hash].mevcut;
    }

    /// @notice Kontrat sahibini degistirir (ornegin backend cuzdani degisirse).
    function ownerDegistir(address yeniOwner) public sadeceOwner {
        require(yeniOwner != address(0), "Gecersiz adres");
        owner = yeniOwner;
    }
}

/* eslint-disable no-unused-vars */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      'Parks',
      [
        {
          plat: 'B1234ABC',
          tipe: 'mobil',
          masuk: new Date(),
          keluar: new Date(),
          harga: 10000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          plat: 'B1323BVA',
          tipe: 'motor',
          masuk: new Date(),
          keluar: new Date(),
          harga: 4000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Parks', null, {});
  },
};

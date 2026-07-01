const { Router } = require("express");

const customersController = require("../controllers/customers.controller");

const router = Router();

router.get("/", customersController.listCustomers);
router.post("/", customersController.createCustomer);
router.patch("/", customersController.updateCustomer);
router.get("/tags", customersController.listCustomerTags);
router.post("/tags", customersController.updateCustomerTags);
router.post(
  "/:customerId/messages/:msgId/pin",
  customersController.toggleMessagePin
);

module.exports = router;

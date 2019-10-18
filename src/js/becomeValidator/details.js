import { getValidatorDetails } from '../service/api';
import { setMessage } from '../service/message_box';

let container = null;

const getValidatorDetailsFormEls = () => {
  if (!container) return {};
  const telegramIdEl = container.querySelector("input[name='telegram_id']");
  const nodeWalletAddressEl = container.querySelector(
    "input[name='node_wallet_address']"
  );
  return {
    telegramIdEl,
    nodeWalletAddressEl
  };
};

const getValidatorDetailsFormValues = () => {
  const {
    telegramIdEl,
    nodeWalletAddressEl
  } = this.getValidatorDetailsFormEls();

  let { telegramId = '', nodeWalletAddress = '' } = {};

  if (telegramIdEl) telegramId = telegramIdEl.value;
  if (nodeWalletAddressEl) nodeWalletAddress = nodeWalletAddressEl.value;

  return { telegramId, nodeWalletAddress };
};

const onSubmitGetValidatorDetails = async () => {
  const validatorDetailsValues = this.getValidatorDetailsFormValues();

  try {
    const validatorInfo = await getValidatorDetails({
      ...validatorDetailsValues
    });
  } catch {
    setMessage(
      'There has been a temporary error processing your request, please try again shortly.',
      'error'
    );
  }
};

export const setupValidatorDetailsForm = parentContainer => {
  container = parentContainer.querySelector(
    '#validator-details-form-container'
  );
};

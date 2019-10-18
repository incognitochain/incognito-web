import { registerValidator } from '../service/api';
import { setMessage } from '../service/message_box';

let container = null;

const getRegisterFormEls = () => {
  if (!container) return {};
  const telegramIdEl = container.querySelector("input[name='telegram_id']");
  const nodeWalletAddressEl = container.querySelector(
    "input[name='node_wallet_address']"
  );
  const nodeIPEl = container.querySelector("input[name='node_ip']");
  const referFromEl = container.querySelector("input[name='refer_from']");
  const referFromOtherEl = container.querySelector(
    "input[name='refer_from_other']"
  );
  const feedbackEl = container.querySelector("input[name='feedback']");
  const submitBtnEl = container.querySelector('#register');

  return {
    telegramIdEl,
    nodeWalletAddressEl,
    nodeIPEl,
    referFromEl,
    referFromOtherEl,
    feedbackEl,
    submitBtnEl
  };
};

const getRegisterFormValues = () => {
  const {
    telegramIdEl,
    nodeWalletAddressEl,
    nodeIPEl,
    referFromEl,
    referFromOtherEl,
    feedbackEl
  } = this.getRegisterFormEls();

  let {
    telegramId = '',
    nodeWalletAddress = '',
    nodeIP = '',
    referFrom = '',
    feedback = ''
  } = {};

  if (telegramIdEl) telegramId = telegramIdEl.value;
  if (nodeWalletAddressEl) nodeWalletAddress = nodeWalletAddressEl.value;
  if (nodeIPEl) nodeIP = nodeIPEl.value;
  if (referFromEl) {
    referFrom = referFromEl.value;

    if (referFrom === 'other' && referFromOtherEl) {
      referFrom = referFromOtherEl.value;
    }
  }
  if (feedbackEl) feedback = feedbackEl.value;

  return {
    telegramId,
    nodeWalletAddress,
    nodeIP,
    referFrom,
    feedback
  };
};

const onSubmitRegisterValidatorForm = async () => {
  const registerFormValues = this.getRegisterFormValues();

  try {
    const validatorInfo = await registerValidator({
      ...registerFormValues
    });
  } catch {
    setMessage(
      'There has been a temporary error processing your request, please try again shortly.',
      'error'
    );
  }
};

const setup = () => {
  const { submitBtnEl } = this.getRegisterFormEls();
};

export const setupRegisterForm = parentContainer => {
  container = parentContainer.querySelector('#register-form-container');

  setup();
};

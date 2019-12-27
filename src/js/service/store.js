function getMobileOperatingSystem() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
    return "Android";
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return "iOS";
  }

  return "unknown";
}

function openLink(url) {
  const os = getMobileOperatingSystem();

  console.debug('OS', os);

  if (os === "unknown") {
    window.open(url, '_blank');
    window.focus();
  } else {
    window.location.href = url;
  }
}

function openPlayStore() {
  openLink('https://play.google.com/store/apps/details?id=com.incognito.wallet');
}

function openAppStore() {
  openLink('https://apps.apple.com/us/app/incognito-crypto-wallet/id1475631606');
}

export default () => {
  const playBtns = document.getElementsByClassName('play-store');
  const appleBtns = document.getElementsByClassName('apple-store');

  for (let index = 0; index < playBtns.length; index++) {
    playBtns[index].addEventListener('click', openPlayStore);
  }

  for (let index = 0; index < appleBtns.length; index++) {
    appleBtns[index].addEventListener('click', openAppStore);
  }
}

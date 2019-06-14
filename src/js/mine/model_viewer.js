function main() {
  const container = document.querySelector('#model-viewer .viewer');

  if (!container) return;

  container.innerHTML = `
    <babylon model='${location.origin}/model/device.glb' templates.main.params.fill-screen="true"></babylon>
  `;
}

main();
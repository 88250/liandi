document.body.insertAdjacentHTML("afterbegin", `
<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg"><defs>
  <symbol id="iconClose" viewBox="0 0 32 32">
    <path d="M32 3.221l-12.779 12.779 12.779 12.779-3.221 3.221-12.779-12.779-12.779 12.779-3.221-3.221 12.779-12.779-12.779-12.779 3.221-3.221 12.779 12.779 12.779-12.779z"></path>
  </symbol>
  <symbol id="iconRestore" viewBox="0 0 32 32">
    <path d="M26.812 8.947h-25.835c-0.538 0.003-0.974 0.438-0.977 0.977v16.399c0.005 0.535 0.441 0.968 0.977 0.968 0 0 0 0 0 0h25.835c0.534-0.003 0.967-0.434 0.972-0.967v-16.399c-0.003-0.537-0.436-0.972-0.972-0.977h-0zM26.121 25.682h-24.499v-15.108h24.499z"></path>
    <path d="M31.217 4.712h-25.485c-0.018-0.001-0.040-0.002-0.061-0.002-0.453 0-0.82 0.367-0.82 0.82s0.367 0.82 0.82 0.82c0.022 0 0.043-0.001 0.064-0.002l-0.003 0h24.678v15.578c0.032 0.413 0.376 0.737 0.795 0.737s0.762-0.323 0.795-0.734l0-0.003v-16.422c-0.003-0.433-0.351-0.785-0.783-0.793h-0.001z"></path>
  </symbol>
  <symbol id="iconMax" viewBox="0 0 32 32">
    <path d="M29.714 2.286v27.429h-27.429v-27.429h27.429zM32 0h-32v32h32v-32z"></path>
  </symbol>
  <symbol id="iconMin" viewBox="0 0 32 32">
    <path d="M1.333 14.667h29.333q1.333 0 1.333 1.333v0q0 1.333-1.333 1.333h-29.333q-1.333 0-1.333-1.333v0q0-1.333 1.333-1.333z"></path>
  </symbol>
  <symbol id="iconUp" viewBox="0 0 32 32">
    <path d="M3.75 25.875l-3.75-3.75 16-16 16 16-3.75 3.75-12.25-12.25z"></path>
  </symbol>
  <symbol id="iconDown" viewBox="0 0 32 32">
    <path d="M3.75 6.125l12.25 12.25 12.25-12.25 3.75 3.75-16 16-16-16z"></path>
  </symbol>
  <symbol id="iconSettings" viewBox="0 0 32 32">
    <path d="M16 21.634q2.329 0 3.981-1.653t1.653-3.981-1.653-3.981-3.981-1.653-3.981 1.653-1.653 3.981 1.653 3.981 3.981 1.653zM27.944 17.577l3.38 2.629q0.526 0.376 0.15 1.052l-3.23 5.559q-0.3 0.526-0.977 0.3l-3.981-1.577q-1.577 1.127-2.704 1.577l-0.601 4.207q-0.15 0.676-0.751 0.676h-6.46q-0.601 0-0.751-0.676l-0.601-4.207q-1.427-0.601-2.704-1.577l-3.981 1.577q-0.676 0.225-0.977-0.3l-3.23-5.559q-0.376-0.676 0.15-1.052l3.38-2.629q-0.075-0.526-0.075-1.577t0.075-1.577l-3.38-2.629q-0.526-0.376-0.15-1.052l3.23-5.559q0.3-0.526 0.977-0.3l3.981 1.577q1.577-1.127 2.704-1.577l0.601-4.207q0.15-0.676 0.751-0.676h6.46q0.601 0 0.751 0.676l0.601 4.207q1.427 0.601 2.704 1.577l3.981-1.577q0.676-0.225 0.977 0.3l3.23 5.559q0.376 0.676-0.15 1.052l-3.38 2.629q0.075 0.526 0.075 1.577t-0.075 1.577z"></path>
  </symbol>
  <symbol id="iconHelp" viewBox="0 0 32 32">
    <path d="M14.4 25.6h3.2v-3.2h-3.2v3.2zM16 0c-8.832 0-16 7.168-16 16s7.168 16 16 16 16-7.168 16-16-7.168-16-16-16zM16 28.8c-7.056 0-12.8-5.744-12.8-12.8s5.744-12.8 12.8-12.8 12.8 5.744 12.8 12.8-5.744 12.8-12.8 12.8zM16 6.4c-3.536 0-6.4 2.864-6.4 6.4h3.2c0-1.76 1.44-3.2 3.2-3.2s3.2 1.44 3.2 3.2c0 3.2-4.8 2.8-4.8 8h3.2c0-3.6 4.8-4 4.8-8 0-3.536-2.864-6.4-6.4-6.4z"></path>
  </symbol>
  <symbol id="iconBug" viewBox="0 0 32 32">
    <path d="M30.222 8.889h-4.996c-0.8-1.387-1.902-2.578-3.236-3.484l2.898-2.898-2.507-2.507-3.858 3.858c-0.818-0.196-1.653-0.302-2.524-0.302s-1.707 0.107-2.507 0.302l-3.876-3.858-2.507 2.507 2.88 2.898c-1.316 0.907-2.418 2.098-3.218 3.484h-4.996v3.556h3.716c-0.089 0.587-0.16 1.173-0.16 1.778v1.778h-3.556v3.556h3.556v1.778c0 0.604 0.071 1.191 0.16 1.778h-3.716v3.556h4.996c1.849 3.182 5.28 5.333 9.227 5.333s7.378-2.151 9.227-5.333h4.996v-3.556h-3.716c0.089-0.587 0.16-1.173 0.16-1.778v-1.778h3.556v-3.556h-3.556v-1.778c0-0.604-0.071-1.191-0.16-1.778h3.716v-3.556zM23.111 16v5.333c0 0.391-0.053 0.836-0.124 1.244l-0.178 1.156-0.658 1.156c-1.28 2.204-3.627 3.556-6.151 3.556s-4.871-1.369-6.151-3.556l-0.658-1.138-0.178-1.156c-0.071-0.409-0.124-0.853-0.124-1.262v-7.111c0-0.409 0.053-0.853 0.124-1.244l0.178-1.156 0.658-1.156c0.533-0.924 1.28-1.724 2.151-2.329l1.013-0.693 1.316-0.32c0.551-0.142 1.12-0.213 1.671-0.213 0.569 0 1.12 0.071 1.689 0.213l1.209 0.284 1.084 0.747c0.889 0.604 1.618 1.387 2.151 2.329l0.676 1.156 0.178 1.156c0.071 0.391 0.124 0.836 0.124 1.227v1.778zM12.444 19.556h7.111v3.556h-7.111zM12.444 12.445h7.111v3.556h-7.111z"></path>
  </symbol>
  <symbol id="iconLink" viewBox="0 0 32 32">
    <path d="M32 11.977l-4.585-4.585-10.573 10.573h-16.842v-3.93h15.158l9.45-9.45-4.585-4.585h11.977v11.977zM32 20.023v11.977h-11.977l4.585-4.585-5.801-5.801 2.807-2.807 5.801 5.801z"></path>
  </symbol>
  <symbol id="iconFolder" viewBox="0 0 32 32">
    <path d="M12.77 3.155l3.23 3.23h12.845q1.277 0 2.216 0.977t0.939 2.254v16q0 1.277-0.939 2.254t-2.216 0.977h-25.69q-1.277 0-2.216-0.977t-0.939-2.254v-19.23q0-1.277 0.939-2.254t2.216-0.977h9.615z"></path>
  </symbol>
  <symbol id="iconMD" viewBox="0 0 32 32">
    <path d="M29.693 25.847h-27.386c-1.274 0-2.307-1.033-2.307-2.307v0-15.081c0-1.274 1.033-2.307 2.307-2.307h27.386c1.274 0 2.307 1.033 2.307 2.307v15.079c0 0.001 0 0.002 0 0.003 0 1.274-1.033 2.307-2.307 2.307 0 0 0 0 0 0v0zM7.691 21.231v-6l3.078 3.847 3.076-3.847v6.001h3.078v-10.461h-3.078l-3.076 3.847-3.078-3.847h-3.078v10.464zM28.309 16h-3.078v-5.231h-3.076v5.231h-3.078l4.615 5.386z"></path>
  </symbol>
  <symbol id="iconCloud" viewBox="0 0 32 32">
    <path d="M25.813 13.375q2.563 0.188 4.375 2.094t1.813 4.531q0 2.75-1.969 4.719t-4.719 1.969h-17.313q-3.313 0-5.656-2.344t-2.344-5.656q0-2.938 2.094-5.281t5.031-2.656q1.313-2.438 3.688-3.938t5.188-1.5q3.625 0 6.375 2.281t3.438 5.781z"></path>
  </symbol>
  <symbol id="iconRight" viewBox="0 0 32 32">
    <path d="M6.125 28.25l12.25-12.25-12.25-12.25 3.75-3.75 16 16-16 16z"></path>
  </symbol>
  <symbol id="iconFavorite" viewBox="0 0 32 32">
    <path d="M16 30.685l-2.329-2.103q-3.981-3.606-5.784-5.333t-4.019-4.282-3.042-4.62-0.826-4.244q0-3.681 2.516-6.235t6.272-2.554q4.357 0 7.211 3.38 2.854-3.38 7.211-3.38 3.756 0 6.272 2.554t2.516 6.235q0 2.93-1.953 6.084t-4.244 5.484-7.474 6.986z"></path>
  </symbol>
  <symbol id="iconGraph" viewBox="0 0 32 32">
    <path d="M11.031 9.68l8.265-7.55 0.943 1.032-8.333 7.609-1.469 7.451 7.927 1.21 7.599-6.985 0.945 1.029-7.263 6.676 7.263 6.269-0.912 1.055-6.577-5.674 0.709 8.269-1.39 0.119-0.808-9.413-7.468-1.137 1.203 7.372-1.376 0.226-1.21-7.402-6.033 2.878-0.603-1.261 6.548-3.122 1.431-7.255h-8.987v-1.396h9.594zM10.537 10.497l0.476 0.577h-0.59l0.115-0.577zM9.081 19.836l-0.104-0.636 0.687 0.359-0.584 0.277zM9.805 19.539l0.551-0.557 0.107 0.658-0.659-0.101zM19.422 21.803l-0.902-0.778 0.799-0.409 0.102 1.187zM19.244 20.52l-0.010-0.725 0.412 0.358-0.402 0.368zM10.339 18.72l-0.402-0.574 0.501 0.077-0.099 0.496zM11.602 10.105l-0.087 0.445-0.107 0.099h-0.465l0.074-0.379 0.181-0.165h0.404zM9.934 18.578l-0.082 0.419-0.442 0.209-0.091-0.557 0.511-0.244 0.119 0.725-0.659-0.101 0.105-0.534 0.539 0.082zM18.281 19.851l0.552 0.082 0.074 0.862-0.72-0.621 0.404-0.369 0.412 0.356-0.325 0.3-0.349-0.054-0.048-0.556z"></path>
    <path d="M6.678 26.634c0 2.332 1.891 4.223 4.223 4.223s4.223-1.891 4.223-4.223v0c0-2.332-1.891-4.223-4.223-4.223s-4.223 1.891-4.223 4.223v0z"></path>
    <path d="M20.138 13.28c0 3.276 2.655 5.931 5.931 5.931s5.931-2.655 5.931-5.931v0c-0.056-3.233-2.689-5.832-5.93-5.832s-5.875 2.599-5.93 5.827l-0 0.005z"></path>
    <path d="M0.597 21.877c0 1.426 1.156 2.581 2.582 2.581s2.582-1.156 2.582-2.581v0c0-1.426-1.156-2.581-2.582-2.581s-2.582 1.156-2.582 2.581v0z"></path>
    <path d="M15.552 20.171c0 1.673 1.357 3.030 3.030 3.030s3.030-1.357 3.030-3.030v0c0-1.673-1.357-3.030-3.030-3.030s-3.030 1.357-3.030 3.030v0z"></path>
    <path d="M17.472 29.643c0 1.061 0.86 1.92 1.92 1.92s1.92-0.86 1.92-1.92v0c0-1.061-0.86-1.92-1.92-1.92s-1.92 0.86-1.92 1.92v0z"></path>
    <path d="M-0 10.379c0 1.061 0.86 1.92 1.92 1.92s1.92-0.86 1.92-1.92v0c0-1.061-0.86-1.92-1.92-1.92s-1.92 0.86-1.92 1.92v0zM7.702 18.804c0 1.061 0.86 1.92 1.92 1.92s1.92-0.86 1.92-1.92v0c0-1.061-0.86-1.92-1.92-1.92s-1.92 0.86-1.92 1.92v0z"></path>
    <path d="M23.019 26.634c0 1.684 1.365 3.050 3.050 3.050s3.050-1.365 3.050-3.050v0c0-1.684-1.365-3.050-3.050-3.050s-3.050 1.365-3.050 3.050v0z"></path>
    <path d="M6.485 10.379c0 2.651 2.149 4.8 4.8 4.8s4.8-2.149 4.8-4.8v0c0-2.651-2.149-4.8-4.8-4.8s-4.8 2.149-4.8 4.8v0z"></path>
    <path d="M16.854 2.975c0 1.402 1.137 2.539 2.539 2.539s2.539-1.137 2.539-2.539v0c0-1.402-1.137-2.539-2.539-2.539s-2.539 1.137-2.539 2.539v0z"></path>
  </symbol>
  <symbol id="iconParagraph" viewBox="0 0 32 32">
    <path d="M11.033 19.639q-4.043 0-6.931-2.888t-2.888-6.931 2.888-6.931 6.931-2.888h19.755v4.852h-4.968v27.148h-4.968v-27.148h-4.852v27.148h-4.968v-12.361z"></path>
  </symbol>
</defs></svg>`);

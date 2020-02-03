export class Search {
    constructor() {
        const element = document.createElement('div')
        element.innerHTML = ` <tab-panel>
      <ul slot="master-list">
        <li>Apples</li>
        <li>Pears</li>
        <li>Bananas</li>
        <li>Oranges</li>
        <li>Peaches</li>
        <li>Strawberries</li>
        <li>Blueberries</li>
      </ul>

      <p data-name="Apples">A common, sweet, crunchy fruit, usually green or yellow in color.</p>
      <p data-name="Pears">A fairly common, sweet, usually green fruit, usually softer than Apples.</p>
    </tab-panel>`
    }

}

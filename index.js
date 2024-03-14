import axios from 'axios'
import { JSDOM } from 'jsdom'
import fs from 'node:fs'

/*
    fr - фиксальный регистратор
    scanners - сканеры штрих кода
    pos - pos системы
    terminals - терминалы сбоа данных
    scales - весы
*/

let pages = {
    'Фискальный регистраторы': 'https://pos-center.ru/tag-fiscal-registrar/',
    'Сканеры штрих-кода': 'https://pos-center.ru/bar-code-scanners/',
    'POS-системы': 'https://pos-center.ru/pos-systems/',
    'Терминалы сбора данных': 'https://pos-center.ru/data-collection-terminal/',
    'Весы торговые': 'https://pos-center.ru/vesy-torgovye/'
}


let resultArray = [];

for (let name in pages) {
    let html = (await axios.get(pages[name])).data
    let page = new JSDOM(html)
    let obj = {}
    let result = []

    for (let item of page.window.document.getElementsByClassName('product-item')) {
        let product = {}

        product.name = item.getElementsByClassName('name')[0].getElementsByTagName('b')[0].innerHTML
        product.price = item.getElementsByClassName('pprice')[0].childNodes[1].textContent.slice(1, -1)
        product.image = 'https://pos-center.ru' + item.getElementsByTagName('img')[0].attributes.getNamedItem('src').textContent
        product.values = {}

        for (let prop of item.querySelectorAll('.prop:not(.instock):not(.mt20)')) {
            let key = prop.childNodes[0].textContent.slice(0, -1)
            let value = prop.childNodes[1].textContent.slice(1)

            product.values[key] = value
        }
        result.push(product)
    }
    obj.groupName = name
    obj.items = result
    resultArray.push(obj)

}

fs.writeFileSync('store.json', JSON.stringify(resultArray))

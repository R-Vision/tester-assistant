# Какие тулзы мы используем для автотестов.

Мы используем **jest**.

# Линки по Jest.

https://www.npmjs.com/package/jest

http://facebook.github.io/jest/

http://facebook.github.io/jest/docs/en/getting-started.html

# Как поставить локально.

> npm i -g jest

# Как писать тесты.

## Расположение тестов.

Jest будет подхватывать всё, что есть в директориях `__tests__`.
В Unit тестах, мы создаем такие директории как можно ближе к коду, который они тестируют.
Например, для каждого плагина делаем свою директорию `__tests__`. Если внутри директории с плагином есть
директории с какими-то более вложенными библиотечками, имеет смысл создать `__tests__` и там.

Внутри `__tests__` могут быть директории с тестами, общими файлами для тестов, фикстурами, и т.д.

## Название файлов тестов.

Название теста должно заканчиваться на `.jest.js`.
Например, `my-super-test.jest.js`.
Эти суффиксы нужны, чтобы отделять всякие фикстуры и конфиги от самих тестов.
Также чуть позже планируется поддержать и TIA, и TIA тесты будут называться `my-super-test.tia.js`.

## 

Если кто знает mocha, то, с точки зрения написания тестов - то же самое.

## По возможности, No behaviour driven assertions.

Возможно, snapshots не получится без них.

C Jest идет унаследованное от Jasmin BDD style assertions.
Мы решили их НЕ_юзать по возможности.

```js
test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

## TDD assertions only.

Многие из нас думают, что TDD style проще для понимания и запоминания ассершнов.

```js
test('adds 1 + 2 to equal 3', () => {
  assert.equal(sum(1, 2),3); // assert прямо от node.js.
});
```

Можете юзать `debug-assert`. Это мой npm модуль. К нему есть d.ts.
Вообще, задачка assert либы - выкинуть exception, если что-то пошло не так.

# Как запускать тесты.

Можно сделать себе такой шелл скрипт:

```sh
# rootDir is workaround. Otherwise dir with config will be rootDir.
# https://github.com/facebook/jest/issues/3613
jest --config=/some-your-dir-with-configs/jest.config.js --rootDir
```

Где `jest.config.js`. (суффикс `.config.js` строго обязателен), это файл вида:

```js
module.exports = {
  testRegex: 'jest.js$',
  // collectCoverage: true, 
};
```

При запуске такого шелл скрипта jest рекурсивно поищет в CWD директории `__tests__`, рекурсивно позапускает
в них тесты и распечатает вам репорт, типа:

```
PASS  plugins/get-system-info/__tests__/juniper/serial.jest.js
PASS  plugins/get-system-info/__tests__/cisco_asa/parsers.jest.js
PASS  plugins/get-system-info/__tests__/juniper/users.jest.js
...
Test Suites: 2 failed, 3 passed, 5 total
Tests:       5 failed, 71 passed, 76 total
Snapshots:   0 total
Time:        0.969s
Ran all test suites.
```

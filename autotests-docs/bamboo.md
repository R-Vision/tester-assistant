# Автотесты на бамбу.

## Как примерно выглядит интеграция автотестов с билдами бамбу.

Это билд для development ветки коллектора и 3.4 ветки smp.
https://bdeps.rvision.pro/browse/RV-AT

Здесь можно посмотреть конкретный репорт от автотестов.

https://bdeps.rvision.pro/browse/RV-AT-JOB1-145/test

Обратите внимание на закладки 'Failed tests', 'Successful tests'.

Работает так:

* В конфиге jest указан reporter в JSON.
* У бамбу есть плагин Mocha Test Parser, который берет JSON от Jest.
* Этот парсер делает так, что репорты видны в бамбу.





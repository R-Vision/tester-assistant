# Общие рекомендации по написанию автотестов.

* Лог тестов должен быть информативным, и хорошо отформатированным.

* Не должно быть таких тестов, которые пишут лог только в случае фейлов. Иначе не поймешь, то ли тест нихрена не делал, то ли все ок.

* Если тест что-то пишет в консоль, то тоже все должно быть хорошо отформатировано. Это скорее касается tia тестов. Т.е. в Jest console.log выводится специфично.

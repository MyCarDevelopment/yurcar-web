# Контракт будущего общего API

Это проект контракта, сервер и база данных пока не созданы. Android и Web будут самостоятельными клиентами одного API. Не использовать ChatGPT-аккаунт как замену пользовательской авторизации Юркар.

## Граница адаптера

`load(): Promise<GarageData>` и `save(data): Promise<void>` — интерфейс репозитория. Текущая схема Web v1: `{version:1, vehicles: Vehicle[], activeId: string|null, checks: number[]}`. Vehicle: UUID, brand, model, year|null, mileage|null, records[], tasks[]. Запись: UUID, title, date ISO YYYY-MM-DD|null (для истории обязательна), mileage|null, note. План становится историей по подтверждению; неизвестный пробег остаётся null. Поля Android fuel/gearbox/driving/generation/engine пока не представлены в веб-форме, миграция должна сохранять их на сервере.

ApiRepository показывает форму `GET /v1/garage`, `PUT /v1/garage`. Это только прототип, не готовый протокол синхронизации. Перед реальным подключением дополнить ревизиями / ETag и If-Match с 409/412 при конфликте. Иначе два клиента могут перезаписать изменения друг друга. Предпочтительны операции над отдельными ресурсами вместо полной замены гаража.

## Ресурсы и модель

* users: id, identity provider subject, display name, created_at.
* vehicles: id, owner_id, характеристики Android, odometer, revision, updated_at, deleted_at.
* care_records / care_tasks: id, vehicle_id, даты, пробег, текст, revision; выполнение задачи — атомарная транзакция с созданием истории.
* guide_articles / service_categories / service_companies: стабильные ID, версия, источники, published_at.
* ad_placements / campaigns: период, маркировка, опубликованные материалы. Публичный API отделить от административного.
* trip_checklists: owner_id, items, revision.

## Предлагаемые маршруты

`GET /v1/me`; `GET/POST /v1/vehicles`; `GET/PATCH/DELETE /v1/vehicles/{id}`; операции над `/records` и `/tasks`; `POST /v1/vehicles/{id}/tasks/{taskId}/complete`; `GET /v1/guide`; `GET /v1/services`; `GET /v1/ad-placements`. Авторизация на сервере проверяет владельца каждого ресурса. UUID в URL не является разрешением доступа.

## Перед подключением

Выбрать провайдера авторизации и схему сессий (для Web предпочтительно защищённые HttpOnly Secure cookies с CSRF-защитой либо продуманный OAuth PKCE; для Android — собственный поддерживаемый поток). Текущий tokenProvider — точка внедрения, не хранение токенов. Реализовать валидацию, ограничение запросов и размеров, разрешённые origin CORS, миграции БД, резервные копии и удаление аккаунта. Уточнить требования к обработке персональных данных перед выбором страны размещения.

Перенос локальных данных — явное действие пользователя после входа. Стабильные ID, идемпотентность, ревизии и разрешение конфликтов обязательны. Web-импорт не следует считать автоматической миграцией Android. Разделить /health, staging и production. Не кэшировать приватные ответы API в service worker.

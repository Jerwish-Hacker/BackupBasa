from storages.backends.azure_storage import AzureStorage

class AzureMediaStorage(AzureStorage):
    account_name = 'basastorageblob' # Must be replaced by your <storage_account_name>
    account_key = 'v/f+/KA3pS01IbbJOHjugGi3J8Gg/Wcpzv4f48LZCgYl135ujkc0sYc39wEg5cmekLfRP98FDd+J+AStRLaHlw==' # Must be replaced by your <storage_account_key>
    azure_container = 'media'
    expiration_secs = None

# class AzureStaticStorage(AzureStorage):
#     account_name = 'basastorageblob' # Must be replaced by your storage_account_name
#     account_key = 'KVpo720ZDRpmGDiDtYbXenZjSOQ7X+WaSjTobExE5aqYNmektOWFTBxlg7Q+O++DTKWgedz/abNh+AStjGgS1g==' # Must be replaced by your <storage_account_key>
#     azure_container = 'static'
#     expiration_secs = None
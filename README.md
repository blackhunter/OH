#OM
==

## window.db (object)
* **object** - obiekt, który będzie nasłuchiwany


## window.db.queue
Tablica zdarzeń w kolejce

## window.db.interval
Interval wykonujący zdarzenia, null gdy brak kolejki

## window.db.handler
Konstruktor uchwytu obiektu, posiada własności i metody:

### .handler
```
{
	events: {},			//lista eventów dla uchwytu
	back: {},				//lista ścieżek podlegających zapamiętaniu edycji
	cloned: false,		//czy klon
	silent: false		//czy ma nie emitować eventów przy edycji
};
```

### .get
	Obiekt będący uchwycony

### .backup
	Lista zapamiętanych zmian


### .set ( path, data[, except] )
* **path** (string/array) - ścieżka do obiektu
* **data** - dane do zapisu
* **except** (array) - lista obiektów, które zostaną pominięte przy zapisie, znajdą się jednak w zdarzeniu

```
data może być funkcją, której argumentem będzie modyfikowana wartość, przydatne gdy wartość jest datą
```

### .delete ( path )
* **path** - ścieżka do obiektu

```
usunięcie obiektu
```

### .on ( path, function, object )
* **path** - ścieżka do obiektu
* **function** - funkcja wykonywana po zdarzeniu
* **object** - obiekt zwracany w funkcji

```
tworzenie zdarzenia dla zmiany
```

### .emit ( [event,] path, now, prev )
* **event** (opcjonalnie) - 'set' lub 'delete', przy braku deklaracji odpalane jest zdarzenie 'self' niezależny od obiektów
* **path** (string/array) - ścieżka do obiektu
* **now** - aktualna wartość
* **prev** - poprzednia wartość, w przypadku braku poprzedniej wartości przybiera null, wymagane

```
emit wywoływany jest z każdą modyfikacją obiektu, odpala funkcje przypisane do zdarzenia. Jeżeli nie chcemy zmieniać wartości a chcemy wywołać zdarzenie używamy tej metody.
! emit nie modyfikuje wartości obiektów !
```
package main

import "net/http"

func main() {
	panic(http.ListenAndServe(":3080", http.FileServer(http.Dir("."))))
}
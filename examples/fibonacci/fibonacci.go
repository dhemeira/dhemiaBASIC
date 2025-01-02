package main

import "fmt"

func main() {
	var nums float64
	var a float64
	var b float64
	var c float64

	fmt.Println("How many fibonacci numbers do you want?")
	fmt.Scan(&nums)
	fmt.Println("")

	a = 0
	b = 1
	for nums > 0 {
		fmt.Println(a)
		c = a + b
		a = b
		b = c
		nums = nums - 1
	}
}

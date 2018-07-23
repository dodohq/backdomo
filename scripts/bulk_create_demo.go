package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

// URL backend endpoint to create parcels
const URL = "https://backdemo.herokuapp.com/api/parcel"

func main() {
	reader := bufio.NewReader(os.Stdin)
	var addr string
	for addr == "" {
		fmt.Print("Enter Address: ")
		addr, _ = reader.ReadString('\n')
		addr = strings.TrimSpace(addr)
	}
	var customerContact string
	for customerContact == "" {
		fmt.Print("Enter Contact: ")
		customerContact, _ = reader.ReadString('\n')
		customerContact = strings.TrimSpace(customerContact)
	}
	var howMany int
	for howMany <= 0 {
		fmt.Print("How many time? ")
		howmanyStr, _ := reader.ReadString('\n')
		fmt.Println(howmanyStr)
		howMany, _ = strconv.Atoi(strings.TrimSpace(howmanyStr))
	}
	var can string
	for can != "Y" && can != "N" {
		fmt.Println("Info to submit")
		fmt.Println("Address: " + addr)
		fmt.Println("Contact: " + customerContact)
		fmt.Print("Confirm?(Y/N) ")
		can, _ = reader.ReadString('\n')
		can = strings.TrimSpace(strings.ToUpper(can))
	}

	if can == "N" {
		os.Exit(0)
	}

	var token string
	for token == "" {
		fmt.Print("Enter Token: ")
		token, _ = reader.ReadString('\n')
		token = strings.TrimSpace(token)
	}

	data := map[string]string{
		"customer_contact": customerContact,
		"date_of_delivery": time.Now().Format(time.RFC3339),
		"address":          addr,
	}
	jsonData, _ := json.Marshal(data)
	var resultChannels []chan bool
	for i := 0; i < howMany; i++ {
		resultChannels = append(resultChannels, make(chan bool))
		go func(jsonData []byte, token string, channel chan<- bool) {
			req, _ := http.NewRequest("POST", URL, bytes.NewBuffer(jsonData))
			req.Header.Set("Authorization", token)
			req.Header.Set("Content-Type", "application/json")
			client := &http.Client{}
			resp, e := client.Do(req)
			if e != nil {
				fmt.Println("request", i, e)
				channel <- false
			} else if resp.StatusCode != 201 && resp.StatusCode != 200 {
				b, _ := ioutil.ReadAll(resp.Body)
				fmt.Println("request", i, string(b))
				channel <- false
			}
			defer resp.Body.Close()
			channel <- true
		}(jsonData, token, resultChannels[i])
	}

	doneReq := 0
	for i := 0; i < howMany; i++ {
		goodReq := <-resultChannels[i]
		if goodReq {
			doneReq++
		}
	}
	fmt.Println(doneReq, "requests completed")
}

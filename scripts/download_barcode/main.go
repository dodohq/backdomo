package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// SERVER server url
const SERVER = "https://backdemo.herokuapp.com"

type respStruct struct {
	Parcels []struct {
		ID string `json:"_id"`
	} `json:"parcels"`
}

func main() {
	dirName := os.Args[1]
	reader := bufio.NewReader(os.Stdin)
	var token string
	for token == "" {
		fmt.Print("Enter Token: ")
		token, _ = reader.ReadString('\n')
		token = strings.TrimSpace(token)
	}

	client := &http.Client{}
	req, _ := http.NewRequest("GET", SERVER+"/api/parcel", nil)
	req.Header.Set("Authorization", token)
	resp, e := client.Do(req)
	if e != nil {
		panic(e)
	} else if resp.StatusCode != 200 {
		panic("Error getting all parcels")
	}

	b, _ := ioutil.ReadAll(resp.Body)
	respJSON := respStruct{}
	json.Unmarshal(b, &respJSON)
	var resultsChannels []chan bool

	for i, p := range respJSON.Parcels {
		resultsChannels = append(resultsChannels, make(chan bool))
		go func(dirName, ID string, channel chan<- bool, i int) {
			out, _ := os.Create(filepath.Join(dirName, ID+".png"))
			defer out.Close()
			req, _ := http.NewRequest("GET", SERVER+"/api/parcel/barcode/"+ID, nil)
			req.Header.Set("Authorization", token)
			resp, e := client.Do(req)
			if e != nil {
				fmt.Println("request", i, e)
				channel <- false
			} else if resp.StatusCode != 200 {
				b, _ := ioutil.ReadAll(resp.Body)
				fmt.Println("request", i, string(b))
				channel <- false
			}
			defer resp.Body.Close()
			_, err := io.Copy(out, resp.Body)
			if err != nil {
				channel <- false
			}
			channel <- true
		}(dirName, p.ID, resultsChannels[i], i)
	}

	doneReq := 0
	for i := 0; i < len(respJSON.Parcels); i++ {
		goodReq := <-resultsChannels[i]
		if goodReq {
			doneReq++
		}
	}
	fmt.Println(doneReq, "barcodes downloaded")
}

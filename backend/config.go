package main

import (
	"bufio"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port            string
	AllowedOrigins  []string
	RoomIdleTimeout int
	MaxRequestBody  int64
}

var cfg = loadConfig()

func loadConfig() *Config {
	loadEnvFile(".env.local")
	loadEnvFile(".env")

	return &Config{
		Port:            getEnv("PORT", "8080"),
		AllowedOrigins:  getEnvList("ALLOWED_ORIGINS", []string{"*"}),
		RoomIdleTimeout: getEnvInt("ROOM_IDLE_TIMEOUT", 300),
		MaxRequestBody:  int64(getEnvInt("MAX_REQUEST_BODY", 4096)),
	}
}

func loadEnvFile(filename string) {
	file, err := os.Open(filename)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.TrimSpace(parts[1])
			if os.Getenv(key) == "" {
				os.Setenv(key, value)
			}
		}
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvList(key string, fallback []string) []string {
	if v := os.Getenv(key); v != "" {
		return strings.Split(v, ",")
	}
	return fallback
}

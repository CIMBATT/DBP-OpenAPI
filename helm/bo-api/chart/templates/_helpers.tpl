{{/*
Expand the name of the chart.
*/}}
{{- define "cimbatt-bo-api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "cimbatt-api.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "cimbatt-bo-api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "cimbatt-bo-api.labels" -}}
helm.sh/chart: {{ include "cimbatt-bo-api.chart" . }}
{{ include "cimbatt-bo-api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "cimbatt-bo-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "cimbatt-bo-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
In-cluster base URL of the API Service rendered by this chart.
Used as the default when no explicit URL is configured.
*/}}
{{- define "cimbatt-api.apiUrl" -}}
{{- printf "http://%s-api:%v" .Release.Name (required "api.service.port is required" .Values.api.service.port) }}
{{- end }}


{{/*
Create the name of the service account to use
*/}}
{{- define "cimbatt-api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "cimbatt-bo-1api.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
